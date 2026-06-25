"""Database seed script - populates initial data for immediate usability."""

import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.session import SessionLocal, engine
from app.database.base import Base
from app.models import (
    User,
    Collection,
    Request,
    Environment,
    EnvironmentVariable,
    History,
    OpenTab,
)

DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001"


def seed():
    """Seed the database with sample data."""
    # Create tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Check if already seeded
        existing_user = db.query(User).filter(User.id == DEFAULT_USER_ID).first()
        if existing_user:
            print("Database already seeded. Skipping.")
            return

        print("Seeding database...")

        # 1. Create default user
        user = User(
            id=DEFAULT_USER_ID,
            name="Default User",
            email="user@postman-clone.dev",
        )
        db.add(user)
        db.flush()

        # 2. Create collections
        # Collection 1: JSONPlaceholder
        col1 = Collection(
            id="00000000-0000-0000-0000-000000000010",
            user_id=DEFAULT_USER_ID,
            name="JSONPlaceholder",
            description="Sample requests for the JSONPlaceholder API - a free fake REST API for testing",
            sort_order=0,
        )
        db.add(col1)
        db.flush()

        # Requests for JSONPlaceholder collection
        req1 = Request(
            id="00000000-0000-0000-0000-000000000101",
            collection_id=col1.id,
            name="List All Posts",
            method="GET",
            url="https://jsonplaceholder.typicode.com/posts",
            headers=[
                {"key": "Accept", "value": "application/json", "enabled": True, "description": ""}
            ],
            params=[],
            body=None,
            body_type="none",
            auth_type="none",
            sort_order=0,
        )
        db.add(req1)

        req2 = Request(
            id="00000000-0000-0000-0000-000000000102",
            collection_id=col1.id,
            name="Get Single Post",
            method="GET",
            url="https://jsonplaceholder.typicode.com/posts/1",
            headers=[],
            params=[],
            body=None,
            body_type="none",
            auth_type="none",
            sort_order=1,
        )
        db.add(req2)

        req3 = Request(
            id="00000000-0000-0000-0000-000000000103",
            collection_id=col1.id,
            name="Create Post",
            method="POST",
            url="https://jsonplaceholder.typicode.com/posts",
            headers=[
                {"key": "Content-Type", "value": "application/json", "enabled": True, "description": ""}
            ],
            params=[],
            body={
                "type": "raw_json",
                "content": '{\n  "title": "New Post",\n  "body": "This is the body of the new post.",\n  "userId": 1\n}',
            },
            body_type="raw_json",
            auth_type="none",
            sort_order=2,
        )
        db.add(req3)

        req4 = Request(
            id="00000000-0000-0000-0000-000000000104",
            collection_id=col1.id,
            name="Delete Post",
            method="DELETE",
            url="https://jsonplaceholder.typicode.com/posts/1",
            headers=[],
            params=[],
            body=None,
            body_type="none",
            auth_type="none",
            sort_order=3,
        )
        db.add(req4)

        # Collection 2: Testing APIs
        col2 = Collection(
            id="00000000-0000-0000-0000-000000000020",
            user_id=DEFAULT_USER_ID,
            name="Testing APIs",
            description="Requests that use environment variables for dynamic configuration",
            sort_order=1,
        )
        db.add(col2)
        db.flush()

        req5 = Request(
            id="00000000-0000-0000-0000-000000000201",
            collection_id=col2.id,
            name="Get Users (Env Var)",
            method="GET",
            url="{{BASE_URL}}/users",
            headers=[
                {"key": "Authorization", "value": "Bearer {{TOKEN}}", "enabled": True, "description": "Uses env variable"}
            ],
            params=[],
            body=None,
            body_type="none",
            auth_type="none",
            sort_order=0,
        )
        db.add(req5)

        req6 = Request(
            id="00000000-0000-0000-0000-000000000202",
            collection_id=col2.id,
            name="Update Post (Env Var)",
            method="PUT",
            url="{{BASE_URL}}/posts/1",
            headers=[
                {"key": "Content-Type", "value": "application/json", "enabled": True, "description": ""}
            ],
            params=[],
            body={
                "type": "raw_json",
                "content": '{\n  "id": 1,\n  "title": "Updated Post Title",\n  "body": "Updated body content",\n  "userId": 1\n}',
            },
            body_type="raw_json",
            auth_type="bearer",
            auth_data={"type": "bearer", "token": "{{TOKEN}}"},
            sort_order=1,
        )
        db.add(req6)

        req7 = Request(
            id="00000000-0000-0000-0000-000000000203",
            collection_id=col2.id,
            name="Get Comments by Post",
            method="GET",
            url="{{BASE_URL}}/comments",
            headers=[],
            params=[
                {"key": "postId", "value": "1", "enabled": True, "description": "Filter by post ID"}
            ],
            body=None,
            body_type="none",
            auth_type="none",
            sort_order=2,
        )
        db.add(req7)

        # 3. Create environments
        env1 = Environment(
            id="00000000-0000-0000-0000-000000000030",
            user_id=DEFAULT_USER_ID,
            name="Development",
            is_active=True,
        )
        db.add(env1)
        db.flush()

        db.add(EnvironmentVariable(
            environment_id=env1.id, key="BASE_URL",
            value="https://jsonplaceholder.typicode.com", enabled=True,
        ))
        db.add(EnvironmentVariable(
            environment_id=env1.id, key="TOKEN",
            value="dev-token-123", enabled=True,
        ))

        env2 = Environment(
            id="00000000-0000-0000-0000-000000000040",
            user_id=DEFAULT_USER_ID,
            name="Production",
            is_active=False,
        )
        db.add(env2)
        db.flush()

        db.add(EnvironmentVariable(
            environment_id=env2.id, key="BASE_URL",
            value="https://jsonplaceholder.typicode.com", enabled=True,
        ))
        db.add(EnvironmentVariable(
            environment_id=env2.id, key="TOKEN",
            value="prod-token-456", enabled=True,
        ))

        # 4. Create history entries (5 entries)
        history_entries = [
            History(
                user_id=DEFAULT_USER_ID,
                method="GET",
                url="https://jsonplaceholder.typicode.com/posts",
                request_headers=[{"key": "Accept", "value": "application/json", "enabled": True}],
                request_params=[],
                body_type="none",
                auth_type="none",
                response_status=200,
                response_headers={"content-type": "application/json; charset=utf-8"},
                response_body='[{"userId":1,"id":1,"title":"sunt aut facere repellat provident","body":"quia et suscipit..."}]',
                response_time_ms=245.3,
                response_size_bytes=27520,
            ),
            History(
                user_id=DEFAULT_USER_ID,
                method="GET",
                url="https://jsonplaceholder.typicode.com/posts/1",
                request_headers=[],
                request_params=[],
                body_type="none",
                auth_type="none",
                response_status=200,
                response_headers={"content-type": "application/json; charset=utf-8"},
                response_body='{"userId":1,"id":1,"title":"sunt aut facere repellat provident occaecati excepturi optio reprehenderit","body":"quia et suscipit suscipit recusandae consequuntur expedita et cum reprehenderit molestiae ut ut quas totam nostrum rerum est autem sunt rem eveniet architecto"}',
                response_time_ms=189.7,
                response_size_bytes=292,
            ),
            History(
                user_id=DEFAULT_USER_ID,
                method="POST",
                url="https://jsonplaceholder.typicode.com/posts",
                request_headers=[{"key": "Content-Type", "value": "application/json", "enabled": True}],
                request_params=[],
                request_body={"type": "raw_json", "content": '{"title":"test","body":"test body","userId":1}'},
                body_type="raw_json",
                auth_type="none",
                response_status=201,
                response_headers={"content-type": "application/json; charset=utf-8"},
                response_body='{"title":"test","body":"test body","userId":1,"id":101}',
                response_time_ms=312.1,
                response_size_bytes=68,
            ),
            History(
                user_id=DEFAULT_USER_ID,
                method="GET",
                url="https://jsonplaceholder.typicode.com/users",
                request_headers=[],
                request_params=[],
                body_type="none",
                auth_type="none",
                response_status=200,
                response_headers={"content-type": "application/json; charset=utf-8"},
                response_body='[{"id":1,"name":"Leanne Graham","username":"Bret","email":"Sincere@april.biz"}]',
                response_time_ms=201.4,
                response_size_bytes=5645,
            ),
            History(
                user_id=DEFAULT_USER_ID,
                method="DELETE",
                url="https://jsonplaceholder.typicode.com/posts/1",
                request_headers=[],
                request_params=[],
                body_type="none",
                auth_type="none",
                response_status=200,
                response_headers={"content-type": "application/json; charset=utf-8"},
                response_body="{}",
                response_time_ms=178.9,
                response_size_bytes=2,
            ),
        ]
        for entry in history_entries:
            db.add(entry)

        # 5. Create a default open tab
        tab = OpenTab(
            user_id=DEFAULT_USER_ID,
            tab_type="new",
            title="Untitled Request",
            is_active=True,
            sort_order=0,
        )
        db.add(tab)

        db.commit()
        print("Database seeded successfully!")
        print(f"  - 1 user")
        print(f"  - 2 collections with 7 requests")
        print(f"  - 2 environments with variables")
        print(f"  - 5 history entries")
        print(f"  - 1 default tab")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
