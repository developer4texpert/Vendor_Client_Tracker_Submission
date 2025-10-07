from django.db import models
from django.contrib.auth.models import User

class Client(models.Model):
    name = models.CharField(max_length=255)
    domain_id = models.IntegerField(blank=True, null=True)   # store id
    domain_name = models.CharField(max_length=255, blank=True, null=True)  # store readable name
    street_address = models.CharField(max_length=255, blank=True, null=True) 
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    zipcode = models.CharField(max_length=20, blank=True, null=True)
    contact_name = models.CharField(max_length=255, blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class ClientAddress(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="addresses")
    street_address = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    zipcode = models.CharField(max_length=20, blank=True, null=True)
    address_type = models.CharField(max_length=50, blank=True, null=True)  # e.g., HQ, Branch, Billing
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.client.name} - {self.street_address}, {self.city}"


class Vendor(models.Model):
    ROLE_CHOICES = [
        ('Vendor', 'Vendor'),
        ('Prime Vendor', 'Prime Vendor'),
        ('Implementation Partner', 'Implementation Partner')
    ]
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    designation = models.CharField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)

    # add fields seen in GetVendor
    street_address = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    zipcode = models.CharField(max_length=20, blank=True, null=True)
    status = models.CharField(max_length=50, default="active")  # or choices
    notes = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # add this

    def __str__(self):
        return f"{self.name} ({self.role})"


# 🔹 New model to attach multiple Vendors to a Client with roles
class ClientVendorLink(models.Model):
    ROLE_CHOICES = [
        ("Vendor", "Vendor"),
        ("Prime Vendor", "Prime Vendor"),
        ("Implementation Partner", "Implementation Partner"),
    ]

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="client_vendors")
    vendor = models.ForeignKey('vendors.Vendor', on_delete=models.CASCADE, related_name="vendor_clients")
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # If you want ONE link per client+vendor regardless of role, use this:
        # unique_together = ('client', 'vendor')
        # If you want multiple roles per same vendor+client, keep as-is:
        unique_together = ('client', 'vendor', 'role')

    def __str__(self):
        return f"{self.vendor.name} -> {self.client.name} ({self.role})"


class Consultant(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    skillset = models.TextField(blank=True, null=True)
    hotlist = models.BooleanField(default=False)
    resume = models.FileField(upload_to='resumes/', blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Submission(models.Model):
    STATUS_CHOICES = [
        ('Submitted', 'Submitted'),
        ('Interview', 'Interview'),
        ('Offer', 'Offer'),
        ('Rejected', 'Rejected'),
    ]
    consultant = models.ForeignKey(Consultant, on_delete=models.CASCADE)
    client = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True)
    submission_date = models.DateField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Submission for {self.consultant} to {self.client}"


class VendorChain(models.Model):
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE)
    layer_number = models.PositiveIntegerField()
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE)
    role_at_time = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)


class InterviewSchedule(models.Model):
    consultant = models.ForeignKey(Consultant, on_delete=models.CASCADE)
    marketer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    interview_date = models.DateTimeField()
    feedback = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)


class JobPosting(models.Model):
    source = models.CharField(max_length=100)
    title = models.CharField(max_length=255)
    description = models.TextField()
    url = models.URLField(max_length=500)
    detected_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)