import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Plane, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Helper to construct IPFS URL
const getIpfsUrl = (ipfsUri) => {
  if (!ipfsUri) return null;
  // Assuming ipfsUri is like "ipfs://CID" or just "CID"
  const cid = ipfsUri.replace('ipfs://', '');
  return `https://ipfs.io/ipfs/${cid}`;
};

const NftItem = ({ nft, position }) => {
  const imageUrl = useMemo(() => getIpfsUrl(nft.imageUrl), [nft.imageUrl]);
  // Ensure placeholder.png is in public folder or use a valid path
  const texture = useTexture(imageUrl || '/placeholder.png');

  // Attempt to make the plane aspect ratio similar to the image, default to 1:1 if not available
  const aspectRatio = texture && texture.image ? texture.image.width / texture.image.height : 1;

  return (
    <mesh position={position} castShadow>
      <planeGeometry args={[2, 2 * aspectRatio]} />
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
};

const LuxuryShowroom = ({ listings, walletAddress }) => { // Added walletAddress for future use
  const itemsPerRow = 5;
  const spacing = 3; // Spacing between items

  return (
    <div style={{flexGrow: 1, position: 'relative', width: '100%', height: '100%'}}> {/* Added wrapper div */}
      <Canvas
        camera={{ position: [0, 2, 10], fov: 75 }} // Adjusted camera position
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#0A0B1E' }}
        shadows
      >
        <ambientLight intensity={0.6} /> {/* Slightly increased ambient light */}
      <directionalLight
        castShadow
        position={[10, 15, 10]} // Adjusted light position for better shadows
        intensity={1.2}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-15} // Wider shadow camera
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      <Suspense fallback={null}>
        <Plane
          args={[100, 100]}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.5, 0]}
          receiveShadow
        >
          <meshStandardMaterial attach="material" color="#303030" /> {/* Darker floor */}
        </Plane>
      </Suspense>

      <Suspense fallback={null}> {/* Suspense for all NFT items */}
        {listings && listings.map((nft, index) => {
          const x = (index % itemsPerRow) * spacing - ((itemsPerRow - 1) * spacing) / 2;
          const y = 1.5; // Height of the cards
          const z = Math.floor(index / itemsPerRow) * -spacing * 1.5; // Spacing between rows
          return <NftItem key={nft.id || index} nft={nft} position={[x, y, z]} />;
        })}
      </Suspense>

      <OrbitControls
        enableZoom={true}
        enablePan={true}
        maxPolarAngle={Math.PI / 2.05} // Slightly adjusted max polar angle
        minDistance={2} // Min zoom distance
        maxDistance={30} // Max zoom distance
      />
    </Canvas>
  );
};

export default LuxuryShowroom;
