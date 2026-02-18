
import { useTranslations } from 'next-intl'
import IslamicCards from '../../components/IslamicCards'
import MainPageNavigationSearch from "../../components/MainPageNavigationSearch"
import { TranslationKeys } from '../constants/translationKeys'

export default function HomePage() {
  const t = useTranslations(TranslationKeys.HOME_PAGE)

  return (
    <div className="container mx-auto">
      <section className="text-center flex flex-col gap-5 items-center justify-center">
        <p className="text-16 font-sans max-w-[60%] text-black">
          {t('desc1')}
        </p>
      </section>
     
      <>
        <MainPageNavigationSearch/>
        <section className="text-center flex flex-col gap-5 items-center my-[60px] justify-center">
          <h1 className="text-[#0e202a] mb-5 text-[40px] font-medium">
            {t('desc2.title')}
          </h1>
          <p className="text-lg max-w-[60%] text-black">
            {t('desc2.content')}
          </p>
        </section>
        <IslamicCards/>
      </>
    </div>
  )
}