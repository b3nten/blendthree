import { AssociativeArray} from "./AssociativeArray";
const testScene = `[scene]
name=Test Scene
[objects]
Cube,Meshname,1.3,1.857,1,2.83,2.857,2.903,3.3749,3.374,3.3748
Cube.001,Meshname,1.3,1.857,1,2.83,2.857,2.903,3.3749,3.374,3.3748
Cube.002,Meshname,1.3,1.857,1,2.83,2.857,2.903,3.3749,3.374,3.3748
[empties]
empty.001,1.3,1.857,1,s_property=1,i_property=2,fa_property="1.2,2.3,3.00",
[lights]
pointlight.001,type,posx,posy,posz,color,intensity,distance,decay,power,shadow
[cameras]
camera.001,poro,posx,posy,posz,rotx,roty,rotz,fov,clipnear,clipfar
`

enum ObjectType {
    Object = 'object',
    Camera = 'camera',
    Light = 'light',
    Empty = 'empty'
}

type ObjectDefinition = {
    name: string
    position: [number, number, number],
    rotation: [number, number, number],
    scale: [number, number, number],
    assetFile: string,
    properties: Record<string, unknown>
}
type LightDefinition = {}
type CameraDefinition = {}
type EmptyDefinition = {
    name: string
    position: [number, number, number]
    properties: Record<string, unknown>
}
type Scene = {
    name: string,
    objects: ObjectDefinition[],
    cameras: CameraDefinition[],
    lights: LightDefinition[],
    empties: EmptyDefinition[],
    get(name: string): ObjectDefinition | CameraDefinition | LightDefinition | EmptyDefinition,
    getObject(name: string): ObjectDefinition,
    getCamera(name: string): CameraDefinition,
    getLight(name: string): LightDefinition,
    getEmpty(name: string): EmptyDefinition,
    delete(name: string): void
    has(name: string): ObjectType | false
}
const parseProperties = (asset: string[]) => asset.map(prop => {
    const type = prop.split('_')[0]
    const name = prop.split('_')[1]
    const value = prop.split('=')[1]
    if(type === 's') return { name, value }
    if(type === 'i') return { name, value: parseInt(value) }
    if(type === 'f') return { name, value: parseFloat(value) }
    if(type === 'b') return { name, value: value === 'true' }
})
export function parse(scenefile: string): Scene {
    function getContent(name: string) {
        const start = lines.findIndex(line => line === `[${name}]`)
        const content = [];
        for (let i = start + 1; i < lines.length; i++) {
            if (lines[i].startsWith('[')) {
                return content;
            } else {
                if(lines[i].trim() === '') continue;
                content.push(lines[i].trim())
            }
        }
        return content
    }

    const lines = scenefile.split('\n')

    const objects = new AssociativeArray<ObjectDefinition>()
    const cameras = new AssociativeArray<CameraDefinition>()
    const lights = new AssociativeArray<LightDefinition>()
    const empties = new AssociativeArray<EmptyDefinition>()

    const scene: Scene = {
        name: '',
        lights: objects.array,
        cameras: cameras.array,
        objects: objects.array,
        empties: empties.array,
        get(name: string): ObjectDefinition | CameraDefinition | LightDefinition | EmptyDefinition {
            if (objects.has(name)) return objects.get(name)
            if (cameras.has(name)) return cameras.get(name)
            if (lights.has(name)) return lights.get(name)
            if (empties.has(name)) return empties.get(name)
            return null
        },
        getObject(name: string): ObjectDefinition {
            return objects.get(name)
        },
        getCamera(name: string): CameraDefinition {
            return cameras.get(name)
        },
        getLight(name: string): LightDefinition {
            return lights.get(name)
        },
        getEmpty(name: string): EmptyDefinition {
            return empties.get(name)
        },
        delete(name: string) {
            if (objects.has(name)) objects.delete(name)
            if (cameras.has(name)) cameras.delete(name)
            if (lights.has(name)) lights.delete(name)
            if (empties.has(name)) empties.delete(name)
        },
        has(name: string) {
            if (objects.has(name)) return ObjectType.Object
            if (cameras.has(name)) return ObjectType.Camera
            if (lights.has(name)) return ObjectType.Light
            if (empties.has(name)) return ObjectType.Empty
            return false
        }
    }

    const sceneContent = getContent('scene')
    const objectsContent = getContent('objects')
    const lightsContent = getContent('lights')
    const camerasContent = getContent('cameras')
    const emptiesContent = getContent('empties')

    scene.name = sceneContent.find(
        line => line.startsWith('name=')
    )?.split('=')[1].trim()

    for(const obj of objectsContent) {
        const [
            name,
            assetFile,
            px, py, pz,
            rx, ry, rz,
            sx, sy, sz,
        ] = obj.split(',')
        objects.set(name, {
            name,
            assetFile,
            position: [parseFloat(px), parseFloat(py), parseFloat(pz)],
            rotation: [parseFloat(rx), parseFloat(ry), parseFloat(rz)],
            scale: [parseFloat(sx), parseFloat(sy), parseFloat(sz)],
            properties: {}
        })
    }
    for(const light of lightsContent) {
        const [
            name, type,
            px, py, pz,
            color, intensity, distance,
            decay, power, shadow
        ] = light.split(',')
        lights.set(name, {
            name, type,
            position: [parseFloat(px), parseFloat(py), parseFloat(pz)],
            properties: {}
        })
    }
    for(const camera of camerasContent) {
        const [
            name, type,
            px, py, pz,
            rx, ry, rz,
            fov, clipnear, clipfar
        ] = camera.split(',')
        cameras.set(name, {
            name, type,
            position: [parseFloat(px), parseFloat(py), parseFloat(pz)],
            properties: {}
        })
    }
    for(const empty of emptiesContent) {
        const [
            name,
            px, py, pz,
            ...properties
        ] = empty.split(',')
        empties.set(name, {
            name,
            position: [parseFloat(px), parseFloat(py), parseFloat(pz)],
            properties: {}
        })
    }
    return scene
}

const s = parse(testScene)

console.log(s.get('Cube'))