import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom marker icons with better styling
const createIcon = (color) => {
    return L.divIcon({
        className: 'custom-marker',
        html: `
      <div style="
        width: 28px;
        height: 35px;
        position: relative;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));
      ">
        <svg viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill="${color}" stroke="white" stroke-width="2" d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z"/>
          <circle cx="12" cy="11" r="4" fill="white"/>
        </svg>
      </div>
    `,
        iconSize: [28, 35],
        iconAnchor: [14, 35],
        popupAnchor: [0, -35]
    });
};

const statusColors = {
    reported: '#F59E0B',    // Yellow for active
    verified: '#3B82F6',    // Blue
    in_progress: '#3B82F6', // Blue for in progress
    resolved: '#10B981',    // Green for resolved
    rejected: '#6B7280'
};

// Selection marker for picking locations
const selectionIcon = L.divIcon({
    className: 'selection-marker',
    html: `
    <div style="
      width: 36px;
      height: 45px;
      animation: bounce 0.5s ease forwards;
    ">
      <svg viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="#EF4444" stroke="white" stroke-width="2" d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z"/>
        <circle cx="12" cy="11" r="5" fill="white"/>
      </svg>
    </div>
    <style>
      @keyframes bounce {
        0% { transform: translateY(-20px); opacity: 0; }
        60% { transform: translateY(5px); }
        100% { transform: translateY(0); opacity: 1; }
      }
    </style>
  `,
    iconSize: [36, 45],
    iconAnchor: [18, 45],
    popupAnchor: [0, -45]
});

// Component to handle map events
const MapEvents = ({ onPositionSelect }) => {
    useMapEvents({
        click: (e) => {
            if (onPositionSelect) {
                onPositionSelect([e.latlng.lat, e.latlng.lng]);
            }
        }
    });
    return null;
};

// Component to set India bounds
const SetIndiaBounds = ({ showIndiaOnly }) => {
    const map = useMap();

    useEffect(() => {
        if (showIndiaOnly) {
            // India bounds: SW corner to NE corner
            const indiaBounds = [
                [6.5, 68.0],   // Southwest (bottom-left)
                [35.5, 97.5]   // Northeast (top-right)
            ];
            map.setMaxBounds(indiaBounds);
            map.setMinZoom(4);
            map.fitBounds(indiaBounds, { padding: [20, 20] });
        }
    }, [showIndiaOnly, map]);

    return null;
};

const IssueMap = ({
    issues = [],
    height = '400px',
    selectable = false,
    selectedPosition = null,
    onPositionSelect,
    onIssueClick,
    zoom = 5,
    useLightTiles = false,
    showIndiaOnly = false
}) => {
    // Center of India
    const indiaCenter = [20.5937, 78.9629];

    // Tile options:
    // Light clean tiles
    const lightTileUrl = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
    // Muted dark-gray tiles (good for dark UI)
    const darkGrayTileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    // Voyager tiles (balanced, good visibility)
    const voyagerTileUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

    // Use dark gray for dark themes, voyager for a balanced look
    const tileUrl = useLightTiles ? lightTileUrl : darkGrayTileUrl;

    return (
        <MapContainer
            center={selectedPosition || indiaCenter}
            zoom={showIndiaOnly ? 5 : (selectedPosition ? 15 : zoom)}
            style={{
                height,
                width: '100%',
                borderRadius: 'inherit',
                cursor: selectable ? 'crosshair' : 'grab',
                background: '#1a1a2e'
            }}
            scrollWheelZoom={true}
            maxBoundsViscosity={1.0}
        >
            <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url={tileUrl}
            />

            {/* Set India bounds if showIndiaOnly is true */}
            {showIndiaOnly && <SetIndiaBounds showIndiaOnly={showIndiaOnly} />}

            {selectable && <MapEvents onPositionSelect={onPositionSelect} />}

            {/* Issue markers */}
            {issues.map(issue => {
                if (!issue.location?.coordinates) return null;
                const color = statusColors[issue.status] || statusColors.reported;

                return (
                    <Marker
                        key={issue._id}
                        position={[issue.location.coordinates[1], issue.location.coordinates[0]]}
                        icon={createIcon(color)}
                        eventHandlers={{
                            click: () => onIssueClick && onIssueClick(issue)
                        }}
                    >
                        <Popup>
                            <div style={{
                                minWidth: '180px',
                                padding: '4px'
                            }}>
                                <h4 style={{
                                    margin: '0 0 6px',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    color: '#1a1a1a'
                                }}>
                                    {issue.title}
                                </h4>
                                <p style={{
                                    margin: '0 0 8px',
                                    fontSize: '0.75rem',
                                    color: '#666'
                                }}>
                                    {issue.description?.substring(0, 60)}...
                                </p>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <span style={{
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                        fontSize: '0.65rem',
                                        fontWeight: '600',
                                        background: `${statusColors[issue.status] || statusColors.reported}20`,
                                        color: statusColors[issue.status] || statusColors.reported
                                    }}>
                                        {issue.status?.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}

            {/* Selection marker */}
            {selectable && selectedPosition && (
                <Marker
                    position={selectedPosition}
                    icon={selectionIcon}
                />
            )}
        </MapContainer>
    );
};

export default IssueMap;
