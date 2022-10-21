import { useRef, useEffect } from "react";

declare global {
  interface Window {
    kakao: any;
  }
}

function KakaoMap() {
  const { kakao } = window;
  const ref = useRef(null);
  
  const map = async () => {
    const container = ref.current;
    const mapOption = {
      center: new kakao.maps.LatLng(37.653096, 126.895559),
      level: 3
    };
    const map = new kakao.maps.Map(container, mapOption);

    const markerPosition  = new kakao.maps.LatLng(37.653096, 126.895559); 
    const marker = new kakao.maps.Marker({
        position: markerPosition
    });
    marker.setMap(map);
  }

  useEffect(()=>{
    map();
  },[])
  
  return(
    <div className="kakao-map-container" id="map" ref={ref} />
  )
}

export default KakaoMap;