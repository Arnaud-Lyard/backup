import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import Login from '../components/authentication/Login';
import Logout from '../components/authentication/Logout';
// import { ITestimonial } from '@/types/Testimonial';
// import { Testimonial } from '@/components/feature/Testimonial';
import OnBoardingLogin from '@/components/authentication/OnBoardingLogin';
import { HeaderLayout } from '@/components/layouts/HeaderLayout';
import { Search } from '@/components/feature/Search';

export default async function Home() {
  // const handleTestimonials = async () => {
  //   try {
  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_BACKEND_URL}/testimonial`,
  //       {
  //         method: 'GET',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //       }
  //     );

  //     const data: ITestimonial[] = await response.json();
  //     return data;
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };
  // const testimonials = await handleTestimonials();
  const session = await getServerSession(authOptions);
  if (session) {
    return (
      <div>
        <HeaderLayout></HeaderLayout>
        <Search></Search>
        <div className="flex flex-col space-y-3 justify-center items-center h-screen">
          {/* <Testimonial testimonials={testimonials}></Testimonial> */}
          <div>You are accessing a private page</div>
          <div>Your name is {session.user?.name}</div>
          <div>
            <Logout />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div>
      <HeaderLayout></HeaderLayout>
      <Search></Search>
      <div className="flex flex-col space-y-3 justify-center items-center h-screen">
        <OnBoardingLogin>Vous êtes un professionnel ?</OnBoardingLogin>
        {/* <Testimonial testimonials={testimonials}></Testimonial> */}
        <div>You are accessing a public page</div>
        <div>
          <Login />
        </div>
      </div>
    </div>
  );
}
