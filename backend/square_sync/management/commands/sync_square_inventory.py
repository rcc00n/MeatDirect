from django.core.management.base import BaseCommand

from square_sync.services import sync_inventory_from_square


class Command(BaseCommand):
    help = "Sync inventory counts from Square into Product.square_quantity"

    def handle(self, *args, **options):
        self.stdout.write("Syncing inventory from Square...")
        sync_inventory_from_square()
        self.stdout.write(self.style.SUCCESS("Square inventory sync completed."))
