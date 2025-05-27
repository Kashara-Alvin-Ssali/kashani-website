import React from 'react';
import '../css/Gallery.css'; // We'll create this CSS file next

// A simple way to import all images from a specific folder (for Webpack)
// This will create an object where keys are filenames and values are their paths
function importAll(r) {
  let images = {};
  r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
  return images;
}

// Dynamically import all images from src/assets/gallery/
// Adjust the path './gallery/' if you named the subfolder differently
const galleryImages = importAll(require.context('../assets/gallery', false, /\.(png|jpe?g|svg|gif)$/));

const Gallery = () => {
  // You can convert the imported images object into an array for easier mapping
  const imagesArray = Object.keys(galleryImages).map(key => ({
    src: galleryImages[key],
    alt: key.split('.')[0].replace(/[-_]/g, ' ') // Basic alt text from filename
  }));

  return (
    <div className="gallery-container">
      <h1 className="gallery-header">Our Moments of Glory</h1>
      <p className="gallery-intro">Relive the passion, dedication, and victories of Kashani FC.</p>

      <div className="image-grid">
        {imagesArray.length > 0 ? (
          imagesArray.map((image, index) => (
            <div key={index} className="gallery-item">
              <img src={image.src} alt={image.alt} loading="lazy" />
              {/* You can add captions here if you want, perhaps from a data array */}
              {/* <p className="image-caption">{image.alt}</p> */}
            </div>
          ))
        ) : (
          <p>No images found in the gallery yet. Check your `src/assets/gallery` folder.</p>
        )}
      </div>
    </div>
  );
};

export default Gallery;