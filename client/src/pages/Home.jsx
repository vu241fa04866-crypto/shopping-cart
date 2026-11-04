import { ArrowRight, CreditCard, PackageCheck, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import Products from './Products'
import Hero from '../components/Hero'

const Home = () => {
  const benefits = [
    {
      icon: ShoppingBag,
      title: 'Find something you love',
      description: 'Explore a hand-picked range across beauty, home, and everyday essentials.',
    },
    {
      icon: PackageCheck,
      title: 'A cart that keeps up',
      description: 'Add favorites and adjust quantities before you decide what to take home.',
    },
    {
      icon: CreditCard,
      title: 'Checkout with confidence',
      description: 'Complete your purchase with the secure Stripe checkout experience.',
    },
  ]

  return (
    <main className="pt-16">
      <Hero />

      <section className="container mx-auto grid gap-8 px-5 py-12 md:grid-cols-3">
        {benefits.map(({ icon: Icon, title, description }) => (
          <article key={title} className="flex items-start gap-4">
            <span className="rounded-full bg-green-100 p-3 text-green-700">
              <Icon aria-hidden="true" size={22} />
            </span>
            <div>
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">{description}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="container mx-auto px-5 pb-4 pt-8" aria-labelledby="shop-heading">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-green-700">
              Made for your everyday
            </p>
            <h2 id="shop-heading" className="text-3xl font-bold">
              Find your next favorite
            </h2>
            <p className="mt-2 text-gray-500">
              Browse the collection and discover something worth bringing home.
            </p>
          </div>
          <Link
            className="inline-flex items-center gap-2 font-semibold text-green-700 hover:text-green-800"
            to="/products"
          >
            View all products <ArrowRight aria-hidden="true" size={18} />
          </Link>
        </div>
      </section>

      <Products />
    </main>
  )
}

export default Home
