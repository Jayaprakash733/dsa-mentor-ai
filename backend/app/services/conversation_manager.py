import json
import os
import time
from typing import Any, Dict, List, Optional

import redis


class ConversationManager:
    """Manage active DSA tutor conversations using Redis."""

    def __init__(self):
        self.redis_url = os.getenv(
            "REDIS_URL",
            "redis://localhost:6379/0",
        )

        self.client = redis.from_url(
            self.redis_url,
            decode_responses=True,
        )

        # Keep active conversations for 24 hours
        self.session_ttl = 60 * 60 * 24

        # Redis key containing recent conversation metadata
        self.history_key = "dsa:conversations:index"

    # =====================================================
    # REDIS KEYS
    # =====================================================

    def _key(self, session_id: str) -> str:
        """Generate Redis key for a conversation."""

        return f"dsa:conversation:{session_id}"

    # =====================================================
    # CREATE SESSION
    # =====================================================

    def create_session(
        self,
        session_id: str,
        problem: str = "",
        difficulty: str = "Beginner",
        topic: str = "Arrays",
    ) -> Dict[str, Any]:
        """Create or initialize a conversation session."""

        now = time.time()

        state = {
            "session_id": session_id,
            "problem": problem,
            "difficulty": difficulty,
            "topic": topic,

            # Tutor progress
            "current_step": 1,
            "current_hint_level": 1,
            "current_phase": "understanding",

            # Student state
            "student_last_answer": "",

            # Answer evaluation state
            "awaiting_answer": False,
            "last_tutor_question": "",

            # Message analysis
            "last_content_analysis": {},

            # Conversation history
            "messages": [],

            # History metadata
            "created_at": now,
            "updated_at": now,
        }

        # Save complete conversation
        self.client.set(
            self._key(session_id),
            json.dumps(state),
            ex=self.session_ttl,
        )

        # Add conversation to recent-history index
        self._save_history_metadata(
            session_id=session_id,
            title=self._make_title(problem),
            topic=topic,
            difficulty=difficulty,
            updated_at=now,
        )

        return state

    # =====================================================
    # HISTORY METADATA
    # =====================================================

    def _make_title(
        self,
        text: str,
    ) -> str:
        """Create a short title for sidebar history."""

        if not text:
            return "New Conversation"

        title = " ".join(
            text.strip().split()
        )

        if len(title) > 45:
            title = title[:45].rstrip() + "..."

        return title

    def _save_history_metadata(
        self,
        session_id: str,
        title: str,
        topic: str,
        difficulty: str,
        updated_at: float,
    ) -> None:
        """Save conversation metadata used by the sidebar."""

        metadata = {
            "session_id": session_id,
            "title": title,
            "topic": topic,
            "difficulty": difficulty,
            "updated_at": updated_at,
        }

        self.client.hset(
            self.history_key,
            session_id,
            json.dumps(metadata),
        )

    def _update_history_metadata(
        self,
        session_id: str,
        title: Optional[str] = None,
        topic: Optional[str] = None,
        difficulty: Optional[str] = None,
    ) -> None:
        """Update recent-chat metadata."""

        existing = self.client.hget(
            self.history_key,
            session_id,
        )

        if existing:
            try:
                metadata = json.loads(existing)
            except json.JSONDecodeError:
                metadata = {}
        else:
            metadata = {}

        session = self.get_session(session_id)

        if session:
            if title is None:
                title = self._make_title(
                    session.get("problem", "")
                )

            if topic is None:
                topic = session.get(
                    "topic",
                    "Arrays",
                )

            if difficulty is None:
                difficulty = session.get(
                    "difficulty",
                    "Beginner",
                )

        metadata.update(
            {
                "session_id": session_id,
                "title": title or "New Conversation",
                "topic": topic or "Arrays",
                "difficulty": difficulty or "Beginner",
                "updated_at": time.time(),
            }
        )

        self.client.hset(
            self.history_key,
            session_id,
            json.dumps(metadata),
        )

    # =====================================================
    # GET SESSION
    # =====================================================

    def get_session(
        self,
        session_id: str,
    ) -> Optional[Dict[str, Any]]:
        """Get conversation state from Redis."""

        data = self.client.get(
            self._key(session_id)
        )

        if not data:
            return None

        try:
            return json.loads(data)
        except json.JSONDecodeError:
            return None

    # =====================================================
    # UPDATE SESSION
    # =====================================================

    def update_session(
        self,
        session_id: str,
        **updates: Any,
    ) -> Optional[Dict[str, Any]]:
        """Update selected fields in the conversation state."""

        state = self.get_session(session_id)

        if state is None:
            return None

        state.update(updates)

        state["updated_at"] = time.time()

        self.client.set(
            self._key(session_id),
            json.dumps(state),
            ex=self.session_ttl,
        )

        # Keep sidebar metadata updated
        self._update_history_metadata(
            session_id=session_id,
        )

        return state

    # =====================================================
    # ADD MESSAGE
    # =====================================================

    def add_message(
        self,
        session_id: str,
        role: str,
        content: str,
    ) -> Optional[Dict[str, Any]]:
        """Add a student or mentor message."""

        state = self.get_session(session_id)

        if state is None:
            return None

        state["messages"].append(
            {
                "role": role,
                "content": content,
            }
        )

        state["updated_at"] = time.time()

        # If this is the first student message,
        # use it as the conversation title.
        if (
            role == "student"
            and not state.get("problem")
        ):
            state["problem"] = content

        self.client.set(
            self._key(session_id),
            json.dumps(state),
            ex=self.session_ttl,
        )

        # Update recent-chat metadata
        self._update_history_metadata(
            session_id=session_id,
            title=self._make_title(
                state.get("problem", "")
            ),
            topic=state.get(
                "topic",
                "Arrays",
            ),
            difficulty=state.get(
                "difficulty",
                "Beginner",
            ),
        )

        return state

    # =====================================================
    # GET MESSAGES
    # =====================================================

    def get_messages(
        self,
        session_id: str,
    ) -> List[Dict[str, str]]:
        """Return conversation messages."""

        state = self.get_session(
            session_id
        )

        if state is None:
            return []

        return state.get(
            "messages",
            [],
        )

    # =====================================================
    # GET ALL CONVERSATIONS
    # =====================================================

    def get_conversations(
        self,
    ) -> List[Dict[str, Any]]:
        """Return recent conversations for sidebar."""

        conversations = []

        data = self.client.hgetall(
            self.history_key
        )

        stale_sessions = []

        for session_id, value in data.items():

            try:
                metadata = json.loads(value)
            except json.JSONDecodeError:
                stale_sessions.append(session_id)
                continue

            # Conversation may have expired because
            # the actual session has a 24-hour TTL.
            if not self.client.exists(
                self._key(session_id)
            ):
                stale_sessions.append(session_id)
                continue

            conversations.append(metadata)

        # Remove expired/stale entries
        for session_id in stale_sessions:
            self.client.hdel(
                self.history_key,
                session_id,
            )

        # Newest first
        conversations.sort(
            key=lambda item: item.get(
                "updated_at",
                0,
            ),
            reverse=True,
        )

        return conversations

    # =====================================================
    # STUDENT ANSWER
    # =====================================================

    def update_student_answer(
        self,
        session_id: str,
        answer: str,
    ) -> Optional[Dict[str, Any]]:
        """Store the student's latest answer."""

        return self.update_session(
            session_id,
            student_last_answer=answer,
        )

    # =====================================================
    # AWAITING ANSWER
    # =====================================================

    def set_awaiting_answer(
        self,
        session_id: str,
        awaiting: bool,
        tutor_question: str = "",
    ) -> Optional[Dict[str, Any]]:
        """
        Track whether the tutor is waiting
        for an answer from the student.
        """

        return self.update_session(
            session_id,
            awaiting_answer=awaiting,
            last_tutor_question=tutor_question,
        )

    def is_awaiting_answer(
        self,
        session_id: str,
    ) -> bool:
        """Check whether the tutor is waiting for an answer."""

        state = self.get_session(
            session_id
        )

        if state is None:
            return False

        return state.get(
            "awaiting_answer",
            False,
        )

    # =====================================================
    # LAST TUTOR QUESTION
    # =====================================================

    def get_last_tutor_question(
        self,
        session_id: str,
    ) -> str:
        """Get the last question asked by the tutor."""

        state = self.get_session(
            session_id
        )

        if state is None:
            return ""

        return state.get(
            "last_tutor_question",
            "",
        )

    # =====================================================
    # ADVANCE STEP
    # =====================================================

    def advance_step(
        self,
        session_id: str,
    ) -> Optional[Dict[str, Any]]:
        """Move the tutor to the next learning step."""

        state = self.get_session(
            session_id
        )

        if state is None:
            return None

        state["current_step"] += 1
        state["updated_at"] = time.time()

        self.client.set(
            self._key(session_id),
            json.dumps(state),
            ex=self.session_ttl,
        )

        self._update_history_metadata(
            session_id=session_id,
        )

        return state

    # =====================================================
    # HINT LEVEL
    # =====================================================

    def set_hint_level(
        self,
        session_id: str,
        hint_level: int,
    ) -> Optional[Dict[str, Any]]:
        """Store the current hint level."""

        hint_level = max(
            1,
            min(hint_level, 6),
        )

        return self.update_session(
            session_id,
            current_hint_level=hint_level,
        )

    # =====================================================
    # DELETE SESSION
    # =====================================================

    def delete_session(
        self,
        session_id: str,
    ) -> bool:
        """Delete a conversation session and its history entry."""

        deleted = bool(
            self.client.delete(
                self._key(session_id)
            )
        )

        self.client.hdel(
            self.history_key,
            session_id,
        )

        return deleted


# Global manager instance
conversation_manager = ConversationManager()