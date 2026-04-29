import math
import os

import bpy
from mathutils import Vector


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "public", "models")


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()


def make_d10_mesh(name: str):
    top = Vector((0, 1.18, 0))
    bottom = Vector((0, -1.18, 0))
    ring = []
    for i in range(10):
        angle = (i / 10) * math.tau + math.pi / 10
        y = 0.28 if i % 2 == 0 else -0.28
        ring.append(Vector((math.cos(angle) * 0.92, y, math.sin(angle) * 0.92)))

    verts = [top, bottom, *ring]
    faces = []
    for i in range(10):
        a = 2 + i
        b = 2 + ((i + 1) % 10)
        faces.append((0, a, b))
        faces.append((1, b, a))

    mesh = bpy.data.meshes.new(f"{name}Mesh")
    mesh.from_pydata([tuple(v) for v in verts], [], faces)
    mesh.update()

    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)

    bevel = obj.modifiers.new("soft rounded RPG edges", "BEVEL")
    bevel.width = 0.085
    bevel.segments = 5
    bevel.affect = "EDGES"

    weighted = obj.modifiers.new("weighted normals", "WEIGHTED_NORMAL")
    weighted.keep_sharp = True

    bpy.ops.object.shade_smooth()
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return obj


def make_material(name: str, base, roughness=0.38):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = base
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = 0.0
    bsdf.inputs["Alpha"].default_value = base[3]
    return mat


def create_asset(filename: str, body_color):
    clear_scene()
    body = make_d10_mesh("D10")
    body.data.materials.append(make_material("polished_plastic", body_color))

    empty = bpy.data.objects.new("D10Root", None)
    bpy.context.collection.objects.link(empty)
    body.parent = empty

    bpy.ops.object.light_add(type="AREA", location=(0, 4, 3))
    bpy.context.object.name = "Softbox"
    bpy.context.object.data.energy = 250
    bpy.context.object.data.size = 4

    path = os.path.join(OUT_DIR, filename)
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        use_selection=False,
        export_apply=True,
    )
    return path


os.makedirs(OUT_DIR, exist_ok=True)

create_asset(
    "d10_percentile_blue.glb",
    (0.02, 0.28, 0.86, 1.0),
)

create_asset(
    "d10_units_ivory.glb",
    (0.86, 0.82, 0.68, 1.0),
)

print("Exported d10 GLB assets to", OUT_DIR)
