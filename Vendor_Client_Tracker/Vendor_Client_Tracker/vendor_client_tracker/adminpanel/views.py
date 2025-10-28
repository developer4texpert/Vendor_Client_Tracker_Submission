from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response
from .models import Marketer, Recruiter
from .serializers import MarketerSerializer, RecruiterSerializer


# ---------- MARKETER ----------

@csrf_exempt
@api_view(['POST'])
def AddMarketer(request):
    serializer = MarketerSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Marketer added successfully", "data": serializer.data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(['POST'])
def GetMarketerInfo(request):
    marketer_id = request.data.get('id', None)
    if marketer_id:
        try:
            marketer = Marketer.objects.get(id=marketer_id)
            serializer = MarketerSerializer(marketer)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Marketer.DoesNotExist:
            return Response({"error": "Marketer not found"}, status=status.HTTP_404_NOT_FOUND)
    else:
        marketers = Marketer.objects.all().order_by('-created_at')
        serializer = MarketerSerializer(marketers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ---------- RECRUITER ----------

@csrf_exempt
@api_view(['POST'])
def AddRecruiter(request):
    serializer = RecruiterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Recruiter added successfully", "data": serializer.data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(['POST'])
def GetRecruiterInfo(request):
    recruiter_id = request.data.get('id', None)
    if recruiter_id:
        try:
            recruiter = Recruiter.objects.get(id=recruiter_id)
            serializer = RecruiterSerializer(recruiter)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Recruiter.DoesNotExist:
            return Response({"error": "Recruiter not found"}, status=status.HTTP_404_NOT_FOUND)
    else:
        recruiters = Recruiter.objects.all().order_by('-created_at')
        serializer = RecruiterSerializer(recruiters, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
