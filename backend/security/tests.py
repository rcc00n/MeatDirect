from django.contrib.auth import get_user_model
from django.contrib.auth.signals import user_logged_in
from django.test import RequestFactory, TestCase, override_settings
from django.urls import reverse

from .models import StaffLoginEvent


class StaffLoginEventSignalTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.user_model = get_user_model()

    def test_staff_login_creates_history_row_with_ip_and_source(self):
        user = self.user_model.objects.create_user(
            username="rcc00n",
            email="vadrud2016@gmail.com",
            password="password123",
            is_staff=True,
        )
        request = self.factory.post("/admin/login/")
        request.user = user
        request.META["HTTP_USER_AGENT"] = (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36"
        )
        request.META["HTTP_X_FORWARDED_FOR"] = "204.12.149.60, 10.0.0.2"
        request.META["HTTP_X_REAL_IP"] = "10.0.0.2"
        request.META["HTTP_HOST"] = "api.meatdirectinc.ca"
        request.META["HTTP_ACCEPT_LANGUAGE"] = "en-CA,en;q=0.9"

        user_logged_in.send(sender=self.user_model, request=request, user=user)

        event = StaffLoginEvent.objects.get()
        self.assertEqual(event.username, "rcc00n")
        self.assertEqual(event.email, "vadrud2016@gmail.com")
        self.assertEqual(event.source, StaffLoginEvent.Source.ADMIN)
        self.assertEqual(str(event.ip_address), "204.12.149.60")
        self.assertEqual(event.device_type, StaffLoginEvent.DeviceType.DESKTOP)
        self.assertEqual(event.browser, "Chrome")
        self.assertEqual(event.operating_system, "Windows")
        self.assertEqual(event.host, "api.meatdirectinc.ca")
        self.assertEqual(event.request_headers["HTTP_X_FORWARDED_FOR"], "204.12.149.60, 10.0.0.2")

    def test_non_staff_login_is_ignored(self):
        user = self.user_model.objects.create_user(
            username="customer",
            email="customer@example.com",
            password="password123",
            is_staff=False,
        )
        request = self.factory.post("/accounts/login/")
        request.user = user
        user_logged_in.send(sender=self.user_model, request=request, user=user)
        self.assertEqual(StaffLoginEvent.objects.count(), 0)


@override_settings(
    STORAGES={
        "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
        "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
    }
)
class StaffLoginEventAdminTests(TestCase):
    def setUp(self):
        self.user_model = get_user_model()
        self.admin_user = self.user_model.objects.create_superuser(
            username="admin",
            email="admin@example.com",
            password="password123",
        )
        self.client.force_login(self.admin_user)
        StaffLoginEvent.objects.create(
            user=self.admin_user,
            username=self.admin_user.username,
            email=self.admin_user.email,
            source=StaffLoginEvent.Source.ADMIN,
            login_path="/admin/login/",
            host="api.meatdirectinc.ca",
            ip_address="204.12.149.60",
            location="Edmonton, Alberta, Canada",
            user_agent="Mozilla/5.0",
            device_type=StaffLoginEvent.DeviceType.DESKTOP,
            browser="Chrome",
            operating_system="Windows",
            request_headers={"path": "/admin/login/", "method": "POST"},
        )

    def test_admin_changelist_renders_summary(self):
        response = self.client.get(reverse("admin:security_staffloginevent_changelist"))
        self.assertContains(response, "Successful staff sign-ins over the last 30 days")
        self.assertContains(response, "204.12.149.60")
        self.assertContains(response, "Edmonton, Alberta, Canada")
