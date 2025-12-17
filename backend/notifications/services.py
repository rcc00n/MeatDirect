from io import BytesIO

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from orders.models import Order


def generate_order_receipt_pdf(order: Order) -> bytes:
    """
    Generate a simple 1-page PDF receipt for the given order.
    The PDF must include:
      - Order id and created date
      - Customer name and email
      - Fulfillment type (pickup / delivery)
      - Shipping / pickup details (if present)
      - Line items: product name, quantity, line total
      - Subtotal, tax, total from Order fields
    Return raw PDF bytes.
    """
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    _, height = letter

    y = height - 50
    line_height = 18

    def write_line(text: str) -> None:
        nonlocal y
        pdf.drawString(50, y, text)
        y -= line_height

    pdf.setTitle(f"Order Receipt #{order.id}")

    write_line(f"Order Receipt #{order.id}")
    write_line(f"Created: {order.created_at.strftime('%Y-%m-%d %H:%M')}")
    write_line(f"Customer: {order.full_name}")
    write_line(f"Email: {order.email}")
    fulfillment = (
        order.get_order_type_display()
        if hasattr(order, "get_order_type_display")
        else order.order_type
    )
    write_line(f"Fulfillment: {fulfillment}")

    if order.order_type == Order.OrderType.DELIVERY:
        if order.address_line1:
            write_line(f"Address: {order.address_line1}")
        if order.address_line2:
            write_line(order.address_line2)
        city_line = " ".join(
            part
            for part in [order.city, order.postal_code]
            if part
        ).strip()
        if city_line:
            write_line(city_line)
        if order.delivery_notes:
            write_line(f"Delivery notes: {order.delivery_notes}")
        if order.delivery_service_area:
            write_line(f"Service area: {order.delivery_service_area}")
        if order.delivery_eta_text:
            write_line(f"ETA: {order.delivery_eta_text}")
    elif order.order_type == Order.OrderType.PICKUP:
        if order.pickup_location:
            write_line(f"Pickup location: {order.pickup_location}")
        if order.pickup_instructions:
            write_line(f"Pickup instructions: {order.pickup_instructions}")

    write_line("")
    write_line("Items:")
    for item in order.items.all():
        write_line(
            f"- {item.product_name} x{item.quantity}: ${item.total_cents / 100:.2f}"
        )

    write_line("")
    write_line(f"Subtotal: ${order.subtotal_cents / 100:.2f}")
    if order.order_type == Order.OrderType.DELIVERY:
        write_line(f"Delivery: ${order.delivery_fee_cents / 100:.2f}")
    write_line(f"Tax: ${order.tax_cents / 100:.2f}")
    write_line(f"Total: ${order.total_cents / 100:.2f}")

    pdf.showPage()
    pdf.save()

    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
