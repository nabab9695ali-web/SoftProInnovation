import Header from '../../components/Header'
import Hero from '../../components/Hero'
import Swiper from '../../components/Swiper'
import DealsOfTheDay from '../../components/DealsOfTheDay'
import FeaturedProducts from '../../components/FeaturedProducts'
import RecentlyViewed from '../../components/RecentlyViewed'
import WhyChooseUs from '../../components/WhyChooseUs'
import Testimonials from '../../components/Testimonials'
import Newsletter from '../../components/Newsletter'
import Footer from '../../components/Footer'

const Home = () => {
  return (
    <div>
        <Header/>
        <Hero/>
        <Swiper/>
        <DealsOfTheDay/>
        <FeaturedProducts/>
        <RecentlyViewed/>
        <WhyChooseUs/>
        <Testimonials/>
        <Newsletter/>
        <Footer/>
    </div>
  )
}

export default Home