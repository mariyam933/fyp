
import { Toaster } from "react-hot-toast";

const ToasterProvider = () => {
  return ( 
    <Toaster 
      toastOptions={{
        position: 'top-center',
        duration: 3000,
      }}
    /> 
  );
}
 
export default ToasterProvider;