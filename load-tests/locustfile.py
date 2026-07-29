from locust import HttpUser, task, between

class ApiUser(HttpUser):
    host = "https://media-player-3ebh.onrender.com"
    wait_time = between(1, 3)

    def on_start(self):
        r = self.client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "testpass"
        })
        self.token = r.json().get("token")
        self.headers = {"Authorization": f"Bearer {self.token}"}

    @task(5)
    def get_tracks(self):
        self.client.get("/api/tracks")

    @task(3)
    def search_songs(self):
        self.client.get("/api/tracks/search?q=love")

    @task(2)
    def get_playlists(self):
        self.client.get("/api/playlists", headers=self.headers)

    @task(1)
    def get_playlist_by_id(self):
        # replace with a real playlist ID from your DB
        self.client.get("/api/playlists/PLAYLIST_ID", headers=self.headers)

    @task(1)
    def stream_track(self):
        # replace with a real track ID
        self.client.get("/api/tracks/TRACK_ID/stream", headers=self.headers)

    @task(1)
    def toggle_like(self):
        self.client.post("/api/tracks/TRACK_ID/like", headers=self.headers)