
function LoadingSpinner () {
  const gifPath = 'https://media.tenor.com/RYGLfSXNIRIAAAAi/frieren.gif';
  return (
    <div className='fixed top-0 w-screen left-0 h-screen bg-black bg-opacity-90 z-50 flex items-center justify-center'>

      <div className='w-1/3 h-1/2 flex items-center justify-center'>

        <div className='lg-hidden flex-col items-center justify-center'>
          <img
            src={gifPath}
            className='rounded-md w-36 h-36 mx-auto '>
          </img>
        </div>

        <div className='hidden flex-col items-center justify-center'>
          <img
            src={gifPath}
            className='rounded-md w-56 h-56 mx-auto '>
          </img>
        </div>
      </div>
    </div>
  );
}

export {LoadingSpinner};