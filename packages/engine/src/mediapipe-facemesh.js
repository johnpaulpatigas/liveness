import * as mpFaceMesh from "@mediapipe/face_mesh";

const FaceMeshClass =
  mpFaceMesh.FaceMesh ||
  (typeof window !== "undefined" && "FaceMesh" in window
    ? Reflect.get(window, "FaceMesh")
    : mpFaceMesh.FaceMesh);

const TesselationData =
  mpFaceMesh.FACEMESH_TESSELATION ||
  (typeof window !== "undefined" && "FACEMESH_TESSELATION" in window
    ? Reflect.get(window, "FACEMESH_TESSELATION")
    : mpFaceMesh.FACEMESH_TESSELATION);

export { FaceMeshClass as FaceMesh, TesselationData as FACEMESH_TESSELATION };
export default mpFaceMesh;
