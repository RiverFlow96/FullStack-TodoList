from django.test import TestCase


class UserProfileAndEmailRulesTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="river",
            email="river@example.com",
            password="StrongPass123!",
        )

    def test_register_rejects_duplicate_email_case_insensitive(self):
        payload = {
            "username": "another-user",
            "email": "RIVER@EXAMPLE.COM",
            "password": "AnotherPass123!",
        }

        response = self.client.post("/api/users/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_patch_profile_accepts_same_email_for_same_user(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.patch(
            f"/api/users/{self.user.id}/",
            {"email": "River@Example.com"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, "river@example.com")

    def test_me_endpoint_returns_authenticated_user_profile(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get("/api/users/me/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.user.id)
        self.assertEqual(response.data["email"], "river@example.com")

    def test_regular_user_cannot_list_all_profiles(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get("/api/users/")

        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
