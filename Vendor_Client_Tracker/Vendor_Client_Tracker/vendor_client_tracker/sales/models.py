from django.db import models
from django.conf import settings
from django.utils import timezone
from vendors.models import Vendor
from clients.models import Client
from adminpanel.models import Marketer


class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Visa(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name
    
class Consultant(models.Model):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100)
    dob = models.DateField()
    ssn = models.CharField(max_length=15, unique=True)
    phone_number = models.CharField(max_length=15)
    other_phone_number = models.CharField(max_length=15, blank=True, null=True)
    skype_id = models.CharField(max_length=100, blank=True, null=True)
    skill = models.ForeignKey('Skill', on_delete=models.SET_NULL, null=True)
    expected_rate = models.DecimalField(max_digits=10, decimal_places=2)
    visa_status = models.ForeignKey('Visa', on_delete=models.SET_NULL, null=True)
    passport_number = models.CharField(max_length=20, blank=True, null=True)
    exp = models.BooleanField(default=False)
    gk = models.BooleanField(default=False)
    gk_move_in_date = models.DateField(blank=True, null=True)
    us_entry_date = models.DateField(blank=True, null=True)
    recruiter = models.IntegerField()  # Assuming recruiter ID from another table
    active = models.BooleanField(default=True)
    street_address = models.CharField(max_length=255, blank=True, null=True)
    pref_location = models.CharField(max_length=100, blank=True, null=True)
    priority = models.IntegerField(default=0)
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class ConsultantAddress(models.Model):
    consultant = models.OneToOneField(Consultant, on_delete=models.CASCADE, related_name='address')
    street = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=50)
    zipcode = models.CharField(max_length=10)


class ConsultantEducation(models.Model):
    consultant = models.ForeignKey(Consultant, on_delete=models.CASCADE, related_name='education')
    type = models.CharField(max_length=50)
    university_name = models.CharField(max_length=255)
    major = models.CharField(max_length=100)
    year_of_completion = models.DateField()

class Submission(models.Model):
    consultant = models.ForeignKey(Consultant, on_delete=models.CASCADE, related_name='submissions')
    skill = models.ForeignKey(Skill, on_delete=models.SET_NULL, null=True, related_name='submission_skills')
    vendor = models.ForeignKey(Vendor, on_delete=models.SET_NULL, null=True, related_name='vendor_submissions')
    prime_vendor = models.ForeignKey(Vendor, on_delete=models.SET_NULL, null=True, blank=True, related_name='prime_vendor_submissions')
    implementation_partner = models.ForeignKey(Vendor, on_delete=models.SET_NULL, null=True, blank=True, related_name='impl_partner_submissions')
    end_client = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, related_name='client_submissions')

    marketer = models.ForeignKey(Marketer, on_delete=models.SET_NULL, null=True, related_name='marketer_submissions')

    submission_date = models.DateTimeField(default=timezone.now)

    comments = models.TextField(blank=True, null=True)
    vendor_response = models.CharField(max_length=50, choices=[
        ('ClientSubmitted', 'Submitted to Client'),
        ('ClientRejected', 'Rejected by Client'),
        ('ClientSelected', 'Selected by Client')
    ], default='ClientSubmitted')

    resume_passed_to_client = models.BooleanField(default=False)
    is_duplicate = models.BooleanField(default=False)

    class Meta:
        unique_together = ('consultant', 'vendor', 'prime_vendor', 'implementation_partner', 'end_client')
        ordering = ['-submission_date']

    def __str__(self):
        return f"{self.consultant.first_name} → {self.vendor.name if self.vendor else 'N/A'}"