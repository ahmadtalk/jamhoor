import unittest
from app import welcome_message


class TestApp(unittest.TestCase):
    def test_welcome_message(self):
        self.assertEqual(welcome_message(), "Welcome to Jamhoor application")


if __name__ == "__main__":
    unittest.main()
