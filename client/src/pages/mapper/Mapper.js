import React, { useState, useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth0 } from '@auth0/auth0-react';
import { getData, postData } from '../../api/queries';
import TreeData from '../treedata/TreeData';
import AddTree from '../addtree/AddTree';
// import UserProfile from '../userprofile';
import config from '../../config';
import { makePopupString, setHoverState } from './mapper_utilities';

const featureFlag = {
  vector: true,
};

mapboxgl.accessToken = config.mapbox;

function Mapper() {
  // const componentName = 'Mapper';
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth0();

  // getData from DB
  const treemap = (!featureFlag.vector)
    ? useQuery(['treemap', { city: 'All' }], getData)
    : null;
  // const error = treemap.error || null;
  const mapData = (!featureFlag.vector) ? treemap.data : null;

  const mutateUser = useMutation(postData, {
    onSuccess: () => {
      queryClient.invalidateQueries('user');
    },
  });

  const mapboxElRef = useRef(null); // DOM element to render map
  const [mapContainer, setMap] = useState();
  // const [zoom, setZoom] = useState(15);

  const [coordinatesNewTree, setCoordinatesNewTree] = useState(null);
  const [currentTreeId, setCurrentTreeId] = useState(null);
  const [showTree, setShowTree] = useState(false);
  const [zoomUserSet, setZoom] = useState(9);
  const [health, setHealth] = useState(null);
  // -------------------------
  // Add search
  // -------------------------
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Initialize our map
  useEffect(() => {
    if (isAuthenticated) mutateUser.mutate(['user', user]);

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
    });

    const map = new mapboxgl.Map({
      container: mapboxElRef.current,
      style: 'mapbox://styles/100ktrees/ckffjjvs41b3019ldl5tz9sps',
      center: coordinatesNewTree || [-122.196532, 37.779369],
      zoom: zoomUserSet || 11,
    });

    // Add the control to the map.
    map.addControl(geolocate);
    geolocate.on('geolocate');
    // Add navigation controls to the top right of the canvas
    map.addControl(new mapboxgl.NavigationControl());
    setMap(map);
  }, []);

  useEffect(() => {
    if (!mapContainer) return;
    mapContainer.once('load', () => {
      if (featureFlag.vector) {
        mapContainer.addLayer({
          id: 'public.treedata',
          type: 'circle',
          'source-layer': 'public.treedata',
          source: {
            type: 'vector',
            // url: 'http://localhost:3001/public.treedata.json',
            tiles: [
              'http://localhost:3001/tiles/public.treedata/{z}/{x}/{y}.pbf',
            ],
            // Functions
            // tiles: [
            //   'http://localhost:3001/rpc/public.get_treedata/{z}/{x}/{y}.pbf',
            // ],
          },
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': [
              'match',
              ['get', 'health'],
              'good', 'green',
              'fair', 'orange',
              'poor', 'red',
              'dead', 'black',
              'vacant', '#7c501a',
              'missing', '#7c501a',
              'concrete', '#808080',
              'stump', 'brown',
              /* other */ 'green',
            ],
            'circle-radius': {
              property: 'health',
              base: 1,
              stops: [
                [8, 4],
                [18, 280],
              ],
            },
            'circle-stroke-color': [
              'match',
              ['get', 'health'],
              'good', 'green',
              'fair', 'orange',
              'poor', 'red',
              'dead', 'black',
              'vacant', '#7c501a',
              'missing', '#7c501a',
              'concrete', '#808080',
              'stump', 'brown',
              /* other */ 'green',
            ],
            'circle-stroke-width': 1,

          },
        });

        mapContainer.on('click', 'public.treedata', (e) => {
          console.log('e1e1e1e1e1', 'e.features[0].properties', e.features[0].properties);
          console.log('e1e1e1e1e1', e.lngLat, 'lngLat');
          mapContainer.getCanvas().style.cursor = 'pointer';
          setCurrentTreeId(e.features[0].properties.id_tree);
          setShowTree(true);
        });

        let hoveredStateId = null;
        if (windowWidth > 768) {
          const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
          });
          mapContainer.on('mousemove', 'public.treedata', (e) => {
            if (e.features.length > 0) {
              if (e.features[0].properties.id_tree) {
                // console.log('e.features[0] hover', e.features[0]);
                hoveredStateId = e.features[0].properties.id_tree;
                const hoverState = setHoverState(hoveredStateId, false, hoveredStateId);
                mapContainer.setFeatureState(hoverState);
                mapContainer.setFeatureState({ ...hoverState, ...{ hover: true } });
                mapContainer.getCanvas().style.cursor = 'pointer';

                const coordinates = e.features[0].geometry.coordinates.slice();
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                  coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                const HTML = makePopupString(e.features[0].properties);
                popup.setLngLat(coordinates).setHTML(HTML).addTo(mapContainer);
              }
            }
          });

          // When the mouse leaves the state-fill layer, update the feature state of the
          // previously hovered feature.
          mapContainer.on('mouseleave', 'public.treedata', () => {
            if (hoveredStateId) {
              const hoverState = setHoverState(hoveredStateId, false, hoveredStateId);
              mapContainer.setFeatureState(hoverState);
            }
            hoveredStateId = null;
            mapContainer.getCanvas().style.cursor = '';
            popup.remove();
          });
        }
      }

      //
    });
  }, [mapContainer, health]);

  // USER PROFILE
  // --------------------------
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!userProfileOpen);
  // if (error) return (<div>Failed to load trees</div>);
  return (
    <div className="App">
      <div className="map__container">
        {/* Mapbox container */}
        <div className="mapBox" ref={mapboxElRef} />
      </div>
      {/* userProfileOpen && (
        <UserProfile toggle={toggle} modal={userProfileOpen} />
      ) */}
      {currentTreeId && (
        <TreeData
          map={mapContainer}
          currentTreeId={currentTreeId}
          showTree={showTree}
          setShowTree={setShowTree}
          health={health}
          setHealth={setHealth}
        />
      )}
      <AddTree
        map={mapContainer}
        setZoom={setZoom}
        coordinatesNewTree={coordinatesNewTree}
        setCoordinatesNewTree={setCoordinatesNewTree}
      />

    </div>
  );
}

export default Mapper;
