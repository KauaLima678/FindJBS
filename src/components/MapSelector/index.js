// src/components/MapSelector.js
import React, { forwardRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';

const MapSelector = forwardRef((props, ref) => {
    return (
        <MapContainer 
            center={[-14.235, -51.9253]} // Centro do Brasil
            zoom={4} 
            style={{ height: '100%', width: '100%', borderRadius: '20px'}} 
            ref={ref}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
        </MapContainer>
    );
});

export default MapSelector;