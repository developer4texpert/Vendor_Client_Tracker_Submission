from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from clients.models import ClientVendorLink
from django.utils.timezone import now, timedelta
from django.db.models import Count
from .models import Skill, Visa, Consultant, Submission
from .serializers import SkillSerializer, VisaSerializer, ConsultantSerializer, SubmissionSerializer


# ---------- SKILL ----------
@api_view(['POST'])
def add_skill(request):
    serializer = SkillSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Skill added successfully', 'data': serializer.data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_skills(request):
    skills = Skill.objects.all().order_by('name')
    serializer = SkillSerializer(skills, many=True)
    return Response({'skills': serializer.data}, status=status.HTTP_200_OK)


# ---------- VISA ----------
@api_view(['POST'])
def add_visa(request):
    serializer = VisaSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Visa added successfully', 'data': serializer.data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_visas(request):
    visas = Visa.objects.all().order_by('name')
    serializer = VisaSerializer(visas, many=True)
    return Response({'visas': serializer.data}, status=status.HTTP_200_OK)

@api_view(['POST'])
def add_consultant(request):
    data_list = request.data.get('lstaddconslmodel', [])
    if not data_list:
        return Response({'error': 'No consultant data provided'}, status=status.HTTP_400_BAD_REQUEST)

    created, duplicates = [], []

    for data in data_list:
        # ---------- Main field mapping ----------
        data['email'] = data.pop('Email', None)
        data['first_name'] = data.pop('FirstName', None)
        data['middle_name'] = data.pop('MiddleName', None)
        data['last_name'] = data.pop('LastName', None)
        data['dob'] = data.pop('DOB', None)
        data['ssn'] = data.pop('SSN', None)
        data['phone_number'] = data.pop('PhoneNumber', None)
        data['other_phone_number'] = data.pop('OtherPhoneNumber', None)
        data['skype_id'] = data.pop('SkypeId', None)
        data['skill'] = data.pop('SkillId', None)
        data['expected_rate'] = data.pop('ExpectedRate', None)
        data['visa_status'] = data.pop('VisaStatus', None)
        data['passport_number'] = data.pop('PassportNumber', None)
        data['exp'] = data.pop('Exp', None)
        data['gk'] = data.pop('GK', None)
        data['gk_move_in_date'] = data.pop('GKMoveInDate', None)
        data['us_entry_date'] = data.pop('USEntryDate', None)
        data['recruiter'] = data.pop('Recruiter', None)
        data['active'] = data.pop('Active', None)
        data['street_address'] = data.pop('StreetAddress', None)
        data['pref_location'] = data.pop('PrefLocation', None)
        data['priority'] = data.pop('priority', 0)  # default if not provided

        # ---------- Nested mapping ----------
        if 'AddrInfo' in data:
            addr = data.pop('AddrInfo', {})
            data['address'] = {
                'street': addr.get('Street'),
                'city': addr.get('City'),
                'state': addr.get('State'),
                'zipcode': addr.get('Zipcode'),
            }

        if 'ListOfEdu' in data:
            edu_list = data.pop('ListOfEdu', [])
            data['education'] = []
            for edu in edu_list:
                data['education'].append({
                    'type': edu.get('Type'),
                    'university_name': edu.get('UniversityName'),
                    'major': edu.get('Major'),
                    'year_of_completion': edu.get('YearOfCompletion'),
                })

        # ---------- Duplicate email check ----------
        email = data.get('email')
        if email and Consultant.objects.filter(email__iexact=email).exists():
            duplicates.append(email)
            continue

        # ---------- Create consultant ----------
        serializer = ConsultantSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            created.append(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # ---------- Final response ----------
    if duplicates and not created:
        return Response(
            {'message': 'Duplicate email(s) found. No new consultants created.', 'duplicates': duplicates},
            status=status.HTTP_409_CONFLICT
        )
    elif duplicates:
        return Response(
            {'message': 'Some consultants added. Some duplicates skipped.',
             'created': created, 'duplicates': duplicates},
            status=status.HTTP_207_MULTI_STATUS
        )
    else:
        return Response({'message': 'Consultants added successfully', 'data': created}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def get_all_consultants(request):
    consultants = Consultant.objects.all().order_by('-id')
    serializer = ConsultantSerializer(consultants, many=True)
    return Response({'consultants': serializer.data}, status=status.HTTP_200_OK)


@api_view(['POST'])
def get_consultant_by_id(request):
    consl_id = request.data.get('Id')
    try:
        consultant = Consultant.objects.get(id=consl_id)
    except Consultant.DoesNotExist:
        return Response({'error': 'Consultant not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = ConsultantSerializer(consultant)
    return Response({'consultant': serializer.data}, status=status.HTTP_200_OK)


@api_view(['PUT'])
def update_consultant(request):
    consl_id = request.data.get('id')
    if not consl_id:
        return Response({'error': 'Consultant id is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        consultant = Consultant.objects.get(id=consl_id)
    except Consultant.DoesNotExist:
        return Response({'error': 'Consultant not found'}, status=status.HTTP_404_NOT_FOUND)

    data = request.data.copy()

    # ---------- Key Mappings ----------
    data['email'] = data.pop('Email', consultant.email)
    data['first_name'] = data.pop('FirstName', consultant.first_name)
    data['middle_name'] = data.pop('MiddleName', consultant.middle_name)
    data['last_name'] = data.pop('LastName', consultant.last_name)
    data['dob'] = data.pop('DOB', consultant.dob)
    data['ssn'] = data.pop('SSN', consultant.ssn)
    data['phone_number'] = data.pop('PhoneNumber', consultant.phone_number)
    data['other_phone_number'] = data.pop('OtherPhoneNumber', consultant.other_phone_number)
    data['skype_id'] = data.pop('SkypeId', consultant.skype_id)
    data['skill'] = data.pop('SkillId', consultant.skill_id)
    data['expected_rate'] = data.pop('ExpectedRate', consultant.expected_rate)
    data['visa_status'] = data.pop('VisaStatus', consultant.visa_status_id)
    data['passport_number'] = data.pop('PassportNumber', consultant.passport_number)
    data['exp'] = data.pop('Exp', consultant.exp)
    data['gk'] = data.pop('GK', consultant.gk)
    data['gk_move_in_date'] = data.pop('GKMoveInDate', consultant.gk_move_in_date)
    data['us_entry_date'] = data.pop('USEntryDate', consultant.us_entry_date)
    data['recruiter'] = data.pop('Recruiter', consultant.recruiter)
    data['active'] = data.pop('Active', consultant.active)
    data['street_address'] = data.pop('StreetAddress', consultant.street_address)
    data['pref_location'] = data.pop('PrefLocation', consultant.pref_location)
    data['priority'] = data.pop('priority', consultant.priority)

    # ---------- Nested Mapping ----------
    if 'AddrInfo' in data:
        addr = data.pop('AddrInfo', {})
        data['address'] = {
            'street': addr.get('Street'),
            'city': addr.get('City'),
            'state': addr.get('State'),
            'zipcode': addr.get('Zipcode'),
        }

    if 'ListOfEdu' in data:
        edu_list = data.pop('ListOfEdu', [])
        data['education'] = []
        for edu in edu_list:
            data['education'].append({
                'type': edu.get('Type'),
                'university_name': edu.get('UniversityName'),
                'major': edu.get('Major'),
                'year_of_completion': edu.get('YearOfCompletion'),
            })

    # ---------- Serializer Update ----------
    serializer = ConsultantSerializer(consultant, data=data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Consultant updated successfully', 'data': serializer.data}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['POST'])
def update_consultant_status(request):
    consl_id = request.data.get('ConslId')
    status_flag = request.data.get('Status')

    try:
        consultant = Consultant.objects.get(id=consl_id)
    except Consultant.DoesNotExist:
        return Response({'error': 'Consultant not found'}, status=status.HTTP_404_NOT_FOUND)

    consultant.active = status_flag
    consultant.save()

    msg = "Moved to Hotlist" if status_flag else "Removed from Hotlist"
    return Response({'message': msg, 'consultant_id': consl_id})

# ---------- Add Submission ----------
@api_view(['POST'])
def add_submission(request):
    data = request.data.copy()
    client_id = data.get("ClientId")

    # get attached vendors by role
    attached_vendors = ClientVendorLink.objects.filter(client_id=client_id)
    prime_vendor = attached_vendors.filter(role__iexact="Prime Vendor").first()
    impl_partner = attached_vendors.filter(role__iexact="Implementation Partner").first()

    # Map incoming PascalCase keys to your model fields
    mapped_data = {
        "consultant": data.get("consultant") or data.get("ConsultantId"),
        "skill": data.get("SkillId"), 
        "vendor": data.get("vendor") or data.get("VendorId"),
        "prime_vendor": data.get("PrimeVendorId"),
        "implementation_partner": data.get("ImplementationPartnerId"),
        "end_client": data.get("ClientId"),
        "marketer": data.get("Marketer"),
        "comments": data.get("Comments"),
        "vendor_response": "ClientSubmitted",
        "resume_passed_to_client": False
    }

    # Prevent duplicates where resume already passed to client
    existing = Submission.objects.filter(
        consultant_id=mapped_data["consultant"],
        vendor_id=mapped_data["vendor"],
        prime_vendor_id=mapped_data["prime_vendor"],
        implementation_partner_id=mapped_data["implementation_partner"],
        end_client_id=mapped_data["end_client"],
        resume_passed_to_client=True
    ).exists()

    if existing:
        return Response(
            {"message": "Consultant already submitted to this client chain. Duplicate blocked."},
            status=status.HTTP_409_CONFLICT
        )

    serializer = SubmissionSerializer(data=mapped_data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Submission added successfully"}, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ---------- Update Submission ----------
@api_view(['PUT'])
def update_submission(request):
    submission_id = request.data.get('Id')
    try:
        submission = Submission.objects.get(id=submission_id)
    except Submission.DoesNotExist:
        return Response({'error': 'Submission not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = SubmissionSerializer(submission, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Submission updated successfully', 'data': serializer.data})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---------- Get All Submissions ----------
@api_view(['GET'])
def get_all_submissions(request):
    submissions = Submission.objects.all().select_related(
        'consultant', 'vendor', 'prime_vendor', 'implementation_partner', 'end_client', 'marketer'
    )
    serializer = SubmissionSerializer(submissions, many=True)
    return Response({'submissions': serializer.data})


@api_view(['POST'])
def get_submission_by_id(request):
    submission_id = request.data.get('SubmissionId')
    if not submission_id:
        return Response({'error': 'SubmissionId is required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        submission = Submission.objects.get(id=submission_id)
    except Submission.DoesNotExist:
        return Response({'error': 'Submission not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = SubmissionSerializer(submission)
    return Response({'submission': serializer.data}, status=status.HTTP_200_OK)


@api_view(['POST'])
def get_submissions_by_vendor(request):
    vendor_id = request.data.get('VendorId')
    if not vendor_id:
        return Response({'error': 'VendorId is required'}, status=status.HTTP_400_BAD_REQUEST)
    submissions = Submission.objects.filter(vendor_id=vendor_id)
    serializer = SubmissionSerializer(submissions, many=True)
    return Response({'vendor_submissions': serializer.data}, status=status.HTTP_200_OK)



# ---------- Get Submissions by Client ----------
@api_view(['POST'])
def get_submissions_by_client(request):
    client_id = request.data.get('ClientId')
    if not client_id:
        return Response({'error': 'ClientId is required'}, status=status.HTTP_400_BAD_REQUEST)

    submissions = Submission.objects.filter(end_client_id=client_id)
    serializer = SubmissionSerializer(submissions, many=True)
    return Response({'client_submissions': serializer.data}, status=status.HTTP_200_OK)

# ---------- Get Submissions by Marketer ----------
@api_view(['POST'])
def get_submissions_by_marketer(request):
    marketer_id = request.data.get('MarketerId')
    if not marketer_id:
        return Response({'error': 'MarketerId is required'}, status=status.HTTP_400_BAD_REQUEST)

    submissions = Submission.objects.filter(marketer_id=marketer_id)
    serializer = SubmissionSerializer(submissions, many=True)
    return Response({'marketer_submissions': serializer.data}, status=status.HTTP_200_OK)


# ---------- Get Submissions by Consultant ----------
@api_view(['POST'])
def get_submissions_by_consultant(request):
    consultant_id = request.data.get('ConsultantId')
    if not consultant_id:
        return Response({'error': 'ConsultantId is required'}, status=status.HTTP_400_BAD_REQUEST)

    submissions = Submission.objects.filter(consultant_id=consultant_id)
    serializer = SubmissionSerializer(submissions, many=True)
    return Response({'consultant_submissions': serializer.data}, status=status.HTTP_200_OK)

# ---------- Update Vendor Response ----------
@api_view(['POST'])
def update_vendor_response(request):
    submission_id = request.data.get('SubmissionId')
    response_status = request.data.get('VendorResponse')
    resume_passed = request.data.get('ResumePassedToClient', False)

    try:
        submission = Submission.objects.get(id=submission_id)
    except Submission.DoesNotExist:
        return Response({'error': 'Submission not found'}, status=status.HTTP_404_NOT_FOUND)

    submission.vendor_response = response_status
    submission.resume_passed_to_client = resume_passed
    submission.save()
    return Response({'message': 'Vendor response updated', 'data': SubmissionSerializer(submission).data})


# ---------- Submission Report (day/week/month/year) ----------
@api_view(['POST'])
def submission_report(request):
    period = request.data.get('Period')  # expects 'day', 'week', 'month', 'year'
    today = now().date()

    if period == 'day':
        start_date = today
    elif period == 'week':
        start_date = today - timedelta(days=7)
    elif period == 'month':
        start_date = today - timedelta(days=30)
    elif period == 'year':
        start_date = today - timedelta(days=365)
    else:
        return Response({'error': 'Invalid Period'}, status=status.HTTP_400_BAD_REQUEST)

    submissions = Submission.objects.filter(submission_date__date__gte=start_date)
    total = submissions.count()
    summary = submissions.values('consultant__first_name').annotate(count=Count('id')).order_by('-count')

    return Response({
        'period': period,
        'total_submissions': total,
        'consultant_summary': summary
    }, status=status.HTTP_200_OK)

