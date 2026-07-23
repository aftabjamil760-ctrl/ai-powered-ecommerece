import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { FiStar } from "react-icons/fi";
import "swiper/css";
import "swiper/css/pagination";
import { testimonials } from "../lib/products";
import SectionHeader from "./SectionHeader";

export default function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 md:px-8">
      <SectionHeader
        eyebrow="Loved worldwide"
        title="Kind words from the SummerNest family"
        align="center"
      />
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={24}
        slidesPerView={1}
        autoplay={{ delay: 4500 }}
        pagination={{ clickable: true }}
        breakpoints={{ 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
        className="!pb-14"
      >
        {testimonials.map((t, i) => (
          <SwiperSlide key={i}>
            <div className="h-full rounded-3xl bg-card p-8 shadow-soft ring-1 ring-black/5">
              <div className="mb-4 flex gap-0.5 text-primary">
                {Array.from({ length: t.rating }).map((_, k) => (
                  <FiStar key={k} className="fill-primary" />
                ))}
              </div>
              <p className="font-display text-lg leading-relaxed">"{t.text}"</p>
              <div className="mt-6 flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="h-12 w-12 rounded-full object-cover" />
                <div>
                  <p className="font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

