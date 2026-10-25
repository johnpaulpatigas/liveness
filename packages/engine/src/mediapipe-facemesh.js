import * as mpFaceMesh from "@mediapipe/face_mesh";

const FaceMeshClass =
  mpFaceMesh.FaceMesh ||
  (typeof window !== "undefined" ? window.FaceMesh : undefined);

const TesselationData =
  mpFaceMesh.FACEMESH_TESSELATION ||
  (typeof window !== "undefined" ? window.FACEMESH_TESSELATION : undefined);

export { FaceMeshClass as FaceMesh, TesselationData as FACEMESH_TESSELATION };
export default mpFaceMesh;
