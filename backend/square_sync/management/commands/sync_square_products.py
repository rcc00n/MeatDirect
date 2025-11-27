from django.core.management.base import BaseCommand

from square_sync.services import sync_products_from_square


class Command(BaseCommand):
    help = "Sync products from Square Catalog into local Product table"

    def handle(self, *args, **options):
        self.stdout.write("Syncing products from Square Catalog...")
        sync_products_from_square()
        self.stdout.write(self.style.SUCCESS("Square product sync completed."))
