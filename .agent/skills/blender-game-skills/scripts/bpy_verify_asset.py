"""
Blender Game Asset Verifier & Export Helper
Use inside Blender MCP or blender --python to validate asset compliance before game export.
"""

import sys

# Dynamic import to suppress IDE linter warnings when opened outside Blender
try:
    bpy = sys.modules.get('bpy') or __import__('bpy')
except Exception:
    bpy = None

def verify_active_object():
    if bpy is None:
        print("[INFO] This script runs inside Blender (Blender MCP or 'blender --python'). 'bpy' is Blender's internal module.")
        return False

    obj = bpy.context.active_object
    if not obj:
        print("[FAIL] No active object selected.")
        return False

    print(f"--- Verifying Asset: {obj.name} (Type: {obj.type}) ---")
    passed = True

    # 1. Scale Check
    scale = obj.scale
    if abs(scale.x - 1.0) > 0.001 or abs(scale.y - 1.0) > 0.001 or abs(scale.z - 1.0) > 0.001:
        print(f"[WARN] Scale is not applied: {scale}. Run Ctrl+A -> Apply Scale.")
        passed = False
    else:
        print("[PASS] Scale is applied (1.0, 1.0, 1.0).")

    # 2. Rotation Check
    rot = obj.rotation_euler
    if abs(rot.x) > 0.001 or abs(rot.y) > 0.001 or abs(rot.z) > 0.001:
        print(f"[WARN] Rotation is not applied: {rot}. Run Ctrl+A -> Apply Rotation.")
        passed = False
    else:
        print("[PASS] Rotation is applied (0, 0, 0).")

    # 3. Polycount Check (if Mesh)
    if obj.type == 'MESH':
        mesh = obj.data
        tri_count = sum(len(p.vertices) - 2 for p in mesh.polygons)
        print(f"[INFO] Vertex Count: {len(mesh.vertices)}, Triangle Count: ~{tri_count}")
        if tri_count > 30000:
            print("[WARN] Triangle count exceeds 30,000 budget for a single game prop.")
        else:
            print("[PASS] Polycount within game performance budget.")

        # 4. Check for unweighted vertices if Armature modifier is present
        armature_mod = next((m for m in obj.modifiers if m.type == 'ARMATURE'), None)
        if armature_mod:
            unweighted = [v.index for v in mesh.vertices if len(v.groups) == 0]
            if unweighted:
                print(f"[FAIL] Found {len(unweighted)} unweighted vertices in skinned mesh! (e.g. vertices {unweighted[:5]})")
                passed = False
            else:
                print("[PASS] All vertices assigned to vertex groups.")

    return passed

if __name__ == "__main__":
    verify_active_object()
