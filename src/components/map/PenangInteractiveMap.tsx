'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { ChevronRight } from 'lucide-react'

// A custom map theme (CartoDB Positron for a clean, light look that matches the theme)
const MAP_TILE_URL = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const MAP_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

interface Location {
  id: string;
  name: string;
  nameZh: string;
  category: string;
  img: string;
  lat: number;
  lng: number;
}

// Custom hook to handle map events and bring hovered marker to front
const MarkerLayerController = ({ locations }: { locations: Location[] }) => {
  const map = useMap();

  useEffect(() => {
    // Generate custom icons dynamically for each location so they render directly on the map
    const markers = locations.map(loc => {
      // Create a clean background image style string
      const bgStyle = `background-image: url('${loc.img}'); background-size: cover; background-position: center;`;
      
      const html = `
        <div class="relative group flex flex-col items-center justify-center destination-marker" style="width: 20px; height: 20px;">
          
          <!-- The Hidden Card Container (Animates on hover) -->
          <div class="card-container absolute bottom-full mb-2 pb-4 opacity-0 translate-y-6 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-50 origin-bottom">
            
            <div class="relative w-64 md:w-72 h-80 md:h-96 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.6)] bg-[#111820] flex flex-col cursor-pointer border border-[#C9A84C]/30 backdrop-blur-xl">
              <!-- Background Image -->
              <div class="absolute inset-0 z-0 transition-transform duration-700 ease-out group-hover:scale-110" style="${bgStyle}"></div>
              
              <!-- Blur effect on the sides of the card (instead of black edge) -->
              <div class="absolute inset-0 z-0 pointer-events-none backdrop-blur-xl" style="-webkit-mask-image: radial-gradient(ellipse at center, transparent 60%, black 100%); mask-image: radial-gradient(ellipse at center, transparent 60%, black 100%);"></div>
              
              <!-- Dark gradient overlay for text readability -->
              <div class="absolute inset-0 z-0 bg-gradient-to-t from-[#1A1A2E] via-[#1A1A2E]/70 to-transparent"></div>
              
              <!-- Card Content Overlay -->
              <div class="relative z-10 flex flex-col justify-end h-full p-4 md:p-5 w-full text-white pointer-events-none">
                <!-- Category Label -->
                <div class="bg-[#C9A84C] text-[#1A1A2E] text-[10px] md:text-xs font-bold uppercase tracking-wider px-2 py-1 rounded w-fit mb-2 shadow-sm">
                  ${loc.category}
                </div>
                
                <!-- Title -->
                <h3 class="text-xl md:text-2xl font-serif font-bold leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] m-0 mb-1 text-white">
                  ${loc.name}
                </h3>
                
                <!-- Chinese Name -->
                <p class="text-xs md:text-sm text-gray-300 mb-4 font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  ${loc.nameZh}
                </p>
                
                <!-- Button Area -->
                <div class="w-full bg-white/10 group-hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl py-2 px-3 flex items-center justify-between transition-colors mt-auto">
                  <span class="text-xs font-semibold tracking-wide text-white">View Details</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="m9 18 6-6-6-6"/></svg>
                </div>
              </div>
            </div>
          </div>
          
          <!-- The Always-Visible Point & Name -->
          <div class="relative flex items-center justify-center cursor-pointer z-40">
            <!-- Ping animation behind point -->
            <div class="absolute w-8 h-8 bg-[#C9A84C]/40 rounded-full animate-ping pointer-events-none"></div>
            
            <!-- Point -->
            <div class="w-4 h-4 bg-[#C9A84C] rounded-full border-2 border-white shadow-md group-hover:scale-125 transition-transform duration-300"></div>
            
            <!-- Name Label -->
            <div class="name-label absolute top-full mt-2 text-center whitespace-nowrap group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
              <span class="text-[11px] md:text-xs font-bold text-[#1A1A2E] bg-white/90 backdrop-blur-md px-2 py-1 rounded-md shadow-sm border border-[#C9A84C]/20">
                ${loc.name}
              </span>
            </div>
          </div>

        </div>
      `;

      const icon = new L.DivIcon({
        className: 'bg-transparent',
        html: html,
        iconSize: [20, 20], // Just the size of the core hover area anchor (the point)
        iconAnchor: [10, 10], // Center the anchor on the point
      });

      const marker = L.marker([loc.lat, loc.lng], { icon }).addTo(map);

      // Dynamic hover logic to determine if the card overlaps the header or top edge
      marker.on('mouseover', function (e) {
        this.setZIndexOffset(1000);
        
        const el = this.getElement();
        if (!el) return;
        
        // Find the specific card container and name label inside this marker
        const card = el.querySelector('.card-container') as HTMLElement;
        const nameLabel = el.querySelector('.name-label') as HTMLElement;
        if (!card || !nameLabel) return;
        
        // Get the marker's position relative to the viewport
        const rect = el.getBoundingClientRect();
        
        // Assuming the card height is around 400px (h-96 + padding)
        const estimatedCardHeight = 400; 
        
        // If the marker is too close to the top of the screen (e.g. less than card height + header buffer ~100px)
        // Then we should open it downwards.
        if (rect.top < estimatedCardHeight + 100) {
          // Switch to opening downwards
          card.className = "card-container absolute top-full mt-2 pt-4 opacity-0 -translate-y-6 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-50 origin-top";
          nameLabel.className = "name-label absolute bottom-full mb-2 text-center whitespace-nowrap group-hover:opacity-0 transition-opacity duration-300 pointer-events-none";
        } else {
          // Switch to opening upwards
          card.className = "card-container absolute bottom-full mb-2 pb-4 opacity-0 translate-y-6 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-50 origin-bottom";
          nameLabel.className = "name-label absolute top-full mt-2 text-center whitespace-nowrap group-hover:opacity-0 transition-opacity duration-300 pointer-events-none";
        }
      });
      marker.on('mouseout', function (e) {
        this.setZIndexOffset(0);
      });

      return marker;
    });

    return () => {
      markers.forEach(m => map.removeLayer(m));
    };
  }, [map, locations]);

  return null;
}

export default function PenangInteractiveMap({ locations }: { locations: Location[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <style>{`
        /* Hide default marker pane shadows that interfere with custom HTML */
        .leaflet-marker-pane img { display: none; }
      `}</style>
      <MapContainer 
        center={[5.38, 100.35]} 
        zoom={11} 
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          url={MAP_TILE_URL}
          attribution={MAP_ATTRIBUTION}
        />
        <MarkerLayerController locations={locations} />
      </MapContainer>
    </>
  );
}
