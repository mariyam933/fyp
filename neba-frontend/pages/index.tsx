// pages/login.js
import { Layout } from '@/components/signin/Layout';
import { LoginForm } from '@/components/signin/LoginForm';

const Login = () => {
  
  return (
    <Layout>
      <LoginForm/>
    </Layout>
  );
}

Login.getLayout = function getLayout(page: JSX.Element) {
  return (
    <>
      {page}
    </>
  );
};

export default Login
