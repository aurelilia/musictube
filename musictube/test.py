from django.test import TestCase
from django.contrib.auth.models import User
import json


class FrontendTest(TestCase):

    def setUp(self):
        self.username = 'test'
        self.email = 'test@angm.xyz'
        self.password = 'password'
        self.user = User(username=self.username, email=self.email)
        self.user.set_password(self.password)
        self.user.save()

    def test_frontend_is_returned(self):
        response = self.client.get('')
        self.assertEqual(response.status_code, 302)
        login = self.client.login(username=self.username, password=self.password)
        self.assertTrue(login)
        response = self.client.get('')
        self.assertEqual(response.status_code, 200)

class ApiTest(TestCase):

    def setUp(self):
        self.username = 'test'
        self.email = 'test@angm.xyz'
        self.password = 'password'
        self.user = User(username=self.username, email=self.email)
        self.user.set_password(self.password)
        self.user.save()
        login = self.client.login(username=self.username, password=self.password)
        self.assertTrue(login)

    def test_nonexistant_api_call_should_return_400(self):
        request = self.client.get('/api/i-dont-exist')
        self.assertEqual(request.status_code, 400)

    def test_illegal_or_missing_arguments_should_return_400(self):
        request = self.client.get('/api/getaudio')
        self.assertEqual(request.status_code, 400)

    def test_getaudio_should_return_correct_url(self):
        request = self.client.get('/api/getaudio?url=6y_NJg-xoeE')
        self.assertEqual(request.status_code, 200)
        self.assertTrue('googlevideo' in str(request.content))

    def test_getvideo_should_return_correct_url(self):
        request = self.client.get('/api/getvideo?url=6y_NJg-xoeE')
        self.assertEqual(request.status_code, 200)
        self.assertTrue('googlevideo' in str(request.content))

    def test_fetchplaylists_should_return_playlists(self):
        request = self.client.get('/api/fetchplaylists')
        self.assertEqual(request.status_code, 200)
        # TODO

    def test_addplaylist_should_add_playlist(self):
        request = self.client.get('/api/addplaylist?name=hello')
        self.assertEqual(request.status_code, 200)
        self.assertTrue('hello' in str(self.client.get('/api/fetchplaylists').content))

    def test_addvideo_should_add_video_to_playlist(self):
        request = self.client.get('/api/addplaylist?name=hello')
        playlists = json.loads(self.client.get('/api/fetchplaylists').content)
        request = self.client.get('/api/addvideo?name=6y_NJg-xoeE&listid=' + str(playlists[0]['id']))
        self.assertEqual(request.status_code, 200)
        self.assertTrue('Nitro Fun' in str(self.client.get('/api/fetchplaylists').content))

    def test_deleteplaylist_should_remove_playlist(self):
        request = self.client.get('/api/addplaylist?name=hello')
        playlists = json.loads(self.client.get('/api/fetchplaylists').content)
        request = self.client.get('/api/deleteplaylist?listid=' + str(playlists[0]['id']))
        self.assertEqual(request.status_code, 200)
        self.assertFalse('hello' in str(self.client.get('/api/fetchplaylists').content))

    def test_deletevideo_should_delete_video_from_playlist(self):
        request = self.client.get('/api/addplaylist?name=hello')
        playlists = json.loads(self.client.get('/api/fetchplaylists').content)
        request = self.client.get('/api/addvideo?name=6y_NJg-xoeE&listid=' + str(playlists[0]['id']))
        playlists = json.loads(self.client.get('/api/fetchplaylists').content)
        request = self.client.get('/api/deletevideo?videoid=' + str(playlists[0]['videos'][0]['id']) + '&listid=' + str(playlists[0]['id']))
        self.assertEqual(request.status_code, 200)
        self.assertFalse('Nitro Fun' in str(self.client.get('/api/fetchplaylists').content))

    def test_renameplaylist_should_rename_playlist(self):
        self.client.get('/api/addplaylist?name=hello')
        playlists = json.loads(self.client.get('/api/fetchplaylists').content)
        request = self.client.get('/api/renameplaylist?name=helloagain&listid=' + str(playlists[0]['id']))
        self.assertEqual(request.status_code, 200)
        self.assertTrue('helloagain' in str(self.client.get('/api/fetchplaylists').content))

    def test_renamevideo_should_rename_video(self):
        self.client.get('/api/addplaylist?name=hello')
        playlists = json.loads(self.client.get('/api/fetchplaylists').content)
        request = self.client.get('/api/addvideo?name=6y_NJg-xoeE&listid=' + str(playlists[0]['id']))
        playlists = json.loads(self.client.get('/api/fetchplaylists').content)
        request = self.client.get('/api/renamevideo?name=helloagain&listid=' + str(playlists[0]['id']) + '&videoid=' + str(playlists[0]['videos'][0]['id']))
        self.assertEqual(request.status_code, 200)
        self.assertTrue('helloagain' in str(self.client.get('/api/fetchplaylists').content))
