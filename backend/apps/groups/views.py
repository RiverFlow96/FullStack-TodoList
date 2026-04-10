import logging

from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.tasks.models import TaskGroup
from apps.tasks.serializers import TaskGroupReorderSerializer, TaskGroupSerializer

logger = logging.getLogger(__name__)


class TaskGroupViewSet(viewsets.ModelViewSet):
    serializer_class = TaskGroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TaskGroup.objects.filter(user=self.request.user).order_by("position", "created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(
        detail=False,
        methods=["patch"],
        url_path="reorder",
        url_name="reorder",
    )
    def reorder(self, request):
        serializer = TaskGroupReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        group_ids = serializer.validated_data["groups"]
        queryset = self.get_queryset()

        for index, group_id in enumerate(group_ids):
            queryset.filter(id=group_id).update(position=index)

        return Response(
            {"detail": "Groups reordered successfully."},
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["delete"],
        url_path="delete-with-tasks",
        url_name="delete-with-tasks",
    )
    def delete_with_tasks(self, request, pk=None):
        group = self.get_object()
        delete_tasks = request.data.get("delete_tasks", False)

        if delete_tasks:
            group.tasks.all().delete()
        else:
            group.tasks.update(group=None)

        group.delete()

        return Response(
            {"detail": "Group deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )
