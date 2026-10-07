from typing import Dict, Any

def generate_pairing_rationale(
    mentor: Dict[str, Any],
    mentee: Dict[str, Any],
    subject_name: str,
    strategy: str
) -> Dict[str, str]:
    """
    Generates intelligent AI rationale and collaboration prompts based on strategy
    and student skill profiles.
    """
    mentor_name = mentor.get("name", "Mentor")
    mentee_name = mentee.get("name", "Peer")
    mentor_score = round(float(mentor.get("total_marks", 0)), 1)
    mentee_score = round(float(mentee.get("total_marks", 0)), 1)
    mentor_att = round(float(mentor.get("attendance_pct", 85)), 0)
    mentee_att = round(float(mentee.get("attendance_pct", 80)), 0)

    if strategy == "balanced":
        rationale = (
            f"You both have an equal grip on this subject ({subject_name}). "
            f"With balanced performance metrics ({mentor_name}: {mentor_score} marks, {mentee_name}: {mentee_score} marks), "
            f"collaborating on an advanced project or research initiative will synergize your problem-solving approaches "
            f"and strengthen your core domain expertise."
        )
        prompt = (
            f"Hey {mentee_name}, we've been paired by the AI matching system for {subject_name}! "
            f"Since we share an equivalent grasp on the coursework, let's team up on our micro-project milestone "
            f"and explore research avenues together."
        )
    else:
        # Complementary strategy
        strengths = []
        if mentor_score > mentee_score + 10:
            strengths.append(f"strong conceptual mastery ({mentor_score} marks)")
        if mentor_att > 85:
            strengths.append(f"exemplary lecture consistency ({mentor_att}% attendance)")
        if mentor.get("certs_count", 0) > 0:
            strengths.append(f"{mentor.get('certs_count')} verified technical certification(s)")

        strength_str = ", ".join(strengths) if strengths else "demonstrated subject proficiency"

        gaps = []
        if mentee_score < mentor_score:
            gaps.append(f"bridging formative assessment gaps ({mentee_score} marks)")
        if mentee_att < 80:
            gaps.append("optimizing study schedules and attendance habits")

        gap_str = ", alongside ".join(gaps) if gaps else "reinforcing core architectural paradigms"

        rationale = (
            f"{mentor_name} demonstrates {strength_str} in {subject_name}, positioned to provide "
            f"structured peer guidance to {mentee_name}. This mentorship bridge focuses on {gap_str}, "
            f"fostering accelerated academic recovery and collaborative confidence through hands-on lab work."
        )
        prompt = (
            f"Hi {mentee_name}! I'm {mentor_name}, your assigned peer mentor for {subject_name}. "
            f"I'm looking forward to walking through the tricky concepts together and tackling our micro-project roadmap! "
            f"When are you free for our first review session?"
        )

    return {
        "ai_rationale": rationale,
        "collaboration_prompt": prompt
    }
