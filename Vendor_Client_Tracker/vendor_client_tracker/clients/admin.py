from django.contrib import admin

# Register your models here.
from .models import Client, Vendor, Consultant, Submission, VendorChain, InterviewSchedule, JobPosting

admin.site.register(Client)
admin.site.register(Vendor)
admin.site.register(Consultant)
admin.site.register(Submission)
admin.site.register(VendorChain)
admin.site.register(InterviewSchedule)
admin.site.register(JobPosting)
