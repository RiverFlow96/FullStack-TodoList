import logging

from django.db import models, transaction
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Task, TaskGroup
from .serializers import TaskGroupSerializer, TaskSerializer

logger = logging.getLogger(__name__)


class TaskGroupViewSet(viewsets.ModelViewSet):
    serializer_class = TaskGroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return TaskGroup.objects.all()
        return TaskGroup.objects.filter(user=user)

    def perform_create(self, serializer):
        max_position = TaskGroup.objects.filter(user=self.request.user).aggregate(models.Max("position"))[
            "position__max"
        ]
        next_position = (max_position or 0) + 1
        serializer.save(user=self.request.user, position=next_position)

    @action(detail=False, methods=["patch"])
    def reorder(self, request):
        group_ids = request.data.get("group_ids", [])
        if not group_ids:
            return Response(
                {"error": "group_ids es requerido"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            for position, group_id in enumerate(group_ids):
                TaskGroup.objects.filter(id=group_id, user=request.user).update(position=position)

        return Response({"success": True})


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Task.objects.all()
        return Task.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
