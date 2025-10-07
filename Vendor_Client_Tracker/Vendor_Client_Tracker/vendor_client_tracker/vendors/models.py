from django.db import models

class Vendor(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    )

    name = models.CharField(max_length=255, unique=True)
    street_address = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    zipcode = models.CharField(max_length=20, blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class VendorContact(models.Model):
    vendor = models.ForeignKey(Vendor, related_name="contacts", on_delete=models.CASCADE)
    full_name = models.CharField(max_length=255)
    designation = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} ({self.vendor.name})"


class VendorAddress(models.Model):
    vendor = models.ForeignKey(Vendor, related_name="addresses", on_delete=models.CASCADE)
    type = models.CharField(max_length=50, blank=True, null=True)   # e.g. Billing, Shipping
    street_address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    zipcode = models.CharField(max_length=20, blank=True, null=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type or 'Address'} - {self.vendor.name}"
