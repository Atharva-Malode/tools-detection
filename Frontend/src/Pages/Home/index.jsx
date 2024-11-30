import { useState } from "react";

const Home = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [annotatedImage, setAnnotatedImage] = useState(null);
  const [loading, setLoading] = useState(false); // Spinner state

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
    setAnnotatedImage(null); // Reset annotated image
    setLoading(true); // Show spinner

    const formData = new FormData();
    formData.append("file", file);

    fetch("http://127.0.0.1:8000/detect/", { // Change URL to your FastAPI endpoint
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        setLoading(false); // Hide spinner
        if (data.annotated_image) {
          setAnnotatedImage(`data:image/jpeg;base64,${data.annotated_image}`);
        } else {
          console.error("No image returned.");
        }
      })
      .catch((error) => {
        setLoading(false); // Hide spinner
        console.error("Error:", error);
      });
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="text-2xl font-bold text-black mb-8">
        <h1>Surgical Tool Analysis</h1>
      </div>

      <div className="bg-gray-200 p-8 rounded-lg shadow-lg text-center md:w-2/3 lg:w-1/2">
        <h1 className="text-black mb-8">Upload an Image</h1>

        {/* Centered buttons */}
        <div className="flex justify-center gap-4 mb-8"> {/* Using flex to align buttons side by side */}
          {/* Tracked Video Button */}
          

          {/* Upload Image Button */}
          <label className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full cursor-pointer">
            Upload Image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>

        {loading && (
          <div className="mt-4">
            <div className="spinner border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
            <p className="mt-2 text-blue-700">Processing image...</p>
          </div>
        )}

        {selectedImage && annotatedImage && (
          <div className="mt-8 flex justify-center gap-8">
            <div className="text-center">
              <h2 className="text-black mb-4">Original Image</h2>
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Selected Image"
                className="max-w-full h-auto"
              />
            </div>
            <div className="text-center">
              <h2 className="text-black mb-4">Annotated Image</h2>
              <img
                src={annotatedImage}
                alt="Annotated Image"
                className="max-w-full h-auto"
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 bg-orange-100 text-orange-700 p-2 rounded-lg">
        <p>
          <strong className="font-bold">Note:</strong> Only upload Surgery Images
        </p>
      </div>
    </div>
  );
};

export default Home;
