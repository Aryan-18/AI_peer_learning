import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple
from sklearn.metrics.pairwise import cosine_similarity, euclidean_distances

def compute_complementary_pairings(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Complementary Strategy (Weak + Strong):
    Identifies lagging students in the domain and pairs them with high-performing
    mentors to establish structured peer mentorship.
    """
    if len(df) < 2:
        return []

    # Sort students by composite proficiency
    sorted_df = df.sort_values(by="composite_proficiency", ascending=True).reset_index(drop=True)
    n = len(sorted_df)

    pairs = []
    assigned_indices = set()

    # Split into lower half (mentees) and upper half (mentors)
    mentees_idx = list(range(0, n // 2))
    mentors_idx = list(range(n // 2, n))
    mentors_idx.reverse()  # Top performers first

    # Feature columns for similarity/complementarity analysis
    feat_cols = ["norm_marks", "norm_attendance", "norm_certs"]

    for m_idx in mentees_idx:
        if m_idx in assigned_indices:
            continue
        
        mentee_row = sorted_df.iloc[m_idx]
        best_mentor_idx = None
        best_synergy_score = -1.0

        for candidate_idx in mentors_idx:
            if candidate_idx in assigned_indices or candidate_idx == m_idx:
                continue

            mentor_row = sorted_df.iloc[candidate_idx]

            # Vector calculation
            v_mentee = mentee_row[feat_cols].values.reshape(1, -1)
            v_mentor = mentor_row[feat_cols].values.reshape(1, -1)

            # Complementary synergy:
            # High mentor proficiency + positive work ethic compatibility (attendance alignment)
            knowledge_gap = float(mentor_row["composite_proficiency"] - mentee_row["composite_proficiency"])
            attendance_synergy = 1.0 - abs(float(mentor_row["norm_attendance"] - mentee_row["norm_attendance"]))
            
            # Match score scaled to 70% - 98%
            synergy_score = np.clip(70.0 + (knowledge_gap * 20.0) + (attendance_synergy * 10.0), 65.0, 98.5)

            if synergy_score > best_synergy_score:
                best_synergy_score = synergy_score
                best_mentor_idx = candidate_idx

        if best_mentor_idx is not None:
            assigned_indices.add(m_idx)
            assigned_indices.add(best_mentor_idx)
            pairs.append({
                "mentor": sorted_df.iloc[best_mentor_idx].to_dict(),
                "mentee": sorted_df.iloc[m_idx].to_dict(),
                "strategy": "complementary",
                "match_score": round(float(best_synergy_score), 1)
            })

    # If any remaining unpaired students, pair them balanced
    unassigned = [i for i in range(n) if i not in assigned_indices]
    for i in range(0, len(unassigned) - 1, 2):
        s1 = sorted_df.iloc[unassigned[i]].to_dict()
        s2 = sorted_df.iloc[unassigned[i + 1]].to_dict()
        pairs.append({
            "mentor": s1,
            "mentee": s2,
            "strategy": "balanced",
            "match_score": 82.0
        })

    return pairs

def compute_balanced_pairings(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Balanced Strategy (Average + Average / Peer Collaboration):
    Groups peers who share equivalent mid-tier performance metrics using cosine similarity.
    """
    if len(df) < 2:
        return []

    feat_cols = ["norm_marks", "norm_attendance", "norm_certs", "fa1_ratio", "fa2_ratio", "sa_ratio"]
    X = df[feat_cols].values
    
    # Compute pairwise similarity
    sim_matrix = cosine_similarity(X)
    n = len(df)
    
    assigned = set()
    pairs = []

    # Sort students by proficiency to pair close-ability peers
    sorted_indices = df.sort_values(by="composite_proficiency").index.tolist()

    for idx in sorted_indices:
        if idx in assigned:
            continue

        best_partner = None
        best_sim = -1.0

        for other_idx in sorted_indices:
            if other_idx == idx or other_idx in assigned:
                continue

            sim = sim_matrix[idx, other_idx]
            prof_diff = abs(df.iloc[idx]["composite_proficiency"] - df.iloc[other_idx]["composite_proficiency"])
            
            # Penalize huge gaps in balanced mode
            adjusted_score = sim - (prof_diff * 0.5)

            if adjusted_score > best_sim:
                best_sim = adjusted_score
                best_partner = other_idx

        if best_partner is not None:
            assigned.add(idx)
            assigned.add(best_partner)
            
            # Score scaled 75% to 98%
            match_score = np.clip(round(float((best_sim * 0.5 + 0.5) * 100), 1), 72.0, 97.5)

            pairs.append({
                "mentor": df.iloc[idx].to_dict(),
                "mentee": df.iloc[best_partner].to_dict(),
                "strategy": "balanced",
                "match_score": match_score
            })

    return pairs
