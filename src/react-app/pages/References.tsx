import { FileText, Download, Info } from 'lucide-react';
import GlassCard from '@/react-app/components/GlassCard';
import { useTranslation } from 'react-i18next';
import { ContainerScroll } from '@/react-app/components/ui/container-scroll-animation';

export default function References() {
  const { t } = useTranslation();

  const techStack = [
    { category: t('references.techStackLabels.frontend'), tech: 'React 19 with TypeScript' },
    { category: t('references.techStackLabels.build'), tech: 'Vite 7.x' },
    { category: t('references.techStackLabels.styling'), tech: 'Tailwind CSS 3.4.x' },
    { category: t('references.techStackLabels.animation'), tech: 'Framer Motion 12.x' },
    { category: t('references.techStackLabels.routing'), tech: 'React Router 7.x' },
    { category: t('references.techStackLabels.database'), tech: 'Neon Postgres Serverless' },
    { category: t('references.techStackLabels.auth'), tech: 'Clerk 5.x' },
    { category: t('references.techStackLabels.maps'), tech: 'Leaflet + React Leaflet' },
    { category: t('references.techStackLabels.validation'), tech: 'Zod 3.24.x' },
    { category: t('references.techStackLabels.i18n'), tech: 'i18next + react-i18next' },
    { category: 'NLP & Search', tech: 'Google Gemini 1.5 Flash' },
    { category: 'UI Components', tech: 'Shadcn UI + Aceternity UI' }
  ];

  const additionalLibraries = [
    { name: '@clerk/clerk-react', purpose: t('references.libraryPurposes.auth') },
    { name: 'leaflet', purpose: t('references.libraryPurposes.maps') },
    { name: 'react-leaflet', purpose: t('references.libraryPurposes.reactMaps') },
    { name: 'lucide-react', purpose: t('references.libraryPurposes.icons') },
    { name: 'i18next', purpose: t('references.libraryPurposes.i18n') },
    { name: 'framer-motion', purpose: t('references.libraryPurposes.animation') },
    { name: '@neondatabase/serverless', purpose: 'Database Connectivity' },
    { name: 'clsx / tailwind-merge', purpose: 'Dynamic Styling' }
  ];

  const resourceLinks = [
    { title: 'Alimentando al Pueblo', url: 'https://www.alimentandoalpueblo.org/' },
    { title: 'ACRS (Asian Counseling and Referral Service)', url: 'https://acrs.org/' },
    { title: 'Ballard Food Bank', url: 'https://www.ballardfoodbank.org/' },
    { title: 'El Centro de la Raza', url: 'https://www.elcentrodelaraza.org/' },
    { title: 'Northwest Harvest', url: 'https://www.northwestharvest.org/' },
    { title: 'Rainier Valley Food Bank', url: 'https://www.rvfb.org/' },
    { title: 'University District Food Bank', url: 'https://www.udfb.org/' },
    { title: 'West Seattle Food Bank', url: 'https://www.westseattlefoodbank.org/' },
    { title: 'YouthCare', url: 'https://youthcare.org/' },
    { title: 'Crisis Connections', url: 'https://www.crisisconnections.org/' },
    { title: 'Unsplash (Visual Assets)', url: 'https://unsplash.com/' },
    { title: 'Google Fonts (Typography)', url: 'https://fonts.google.com/' }
  ];

  const imageCredits = [
    'https://www.seattlefoodcommittee.org/wp-content/uploads/2022/02/nw_harvest.jpg',
    'https://projectaccessnw.org/images/crisis-connections-logo.png',
    'https://nwjustice.org/assets/logo_fb.png',
    'https://i0.wp.com/wabarnews.org/wp-content/uploads/2025/11/Nov2025_ULP-logo.jpg?resize=675%2C200&ssl=1',
    'https://framerusercontent.com/images/gt24mlodEFBNlKWWyKhdowkVBc.png',
    'https://dccentralkitchen.org/wp-content/uploads/2022/03/DCCentralKitchen_logo-hi-res.png',
    'https://www.coalitionforthehomeless.org/wp-content/uploads/2023/08/site_logo.svg',
    'https://www.bhchp.org/wp-content/uploads/2022/09/logo-4.png',
    'https://www.freefood.org/gallery/2576_1637595401.jpg',
    'https://images.unsplash.com/photo-1532330393533-443990a51d10?auto=format&fit=crop&q=80',
    'https://media.assettype.com/southseattleemerald%2F2025-11-26%2F4bsjtpqo%2F2025-11.27-Rainier-Valley-Food-Bank-Mural-by-Susan-Fried-9.jpg?w=640&auto=format%2Ccompress',
    'https://img.p.mapq.st/?url=https://s3-media0.fl.yelpcdn.com/bphoto/OdfyRj4vAFXliqb-RvKi5g/l.jpg?w=3840&q=75',
    'https://neighborcare.org/media/4006/pike-content-marketing-card.png',
    'https://seattlemedium.com/wp-content/uploads/2022/11/UW-Medicines-Pioneer-Square-Clinic-748x486px.jpg',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgaXbt6ak400M-jeYQpT1Dr8F22NWEywpRoQ&s',
    'https://komonews.com/resources/media/ab99a381-9349-4d98-87ef-a3e14739113b-large16x9_6.jpg',
    'https://www.desc.org/wp-content/uploads/2024/05/BloomsideCJHeader-2-750x450.jpg',
    'https://i.ytimg.com/vi/odHoR3wtFQo/mqdefault.jpg',
    'https://i0.wp.com/youthcare.org/wp-content/uploads/2018/06/orion-center.jpg?fit=825%2C464&ssl=1',
    'https://www.worksourceskc.org/wp-content/uploads/2024/08/img-0389.jpg',
    'https://iexaminer.org/wp-content/uploads/2018/03/173-1733890_seattle-jobs-initiative-ink-hd-png-download.png',
    'https://www.spl.org/Seattle-Public-Library/images/locations/cen/CEN%20Highlights/CENBuilding_WebGraphic.jpg.jpeg',
    'https://s3.us-east-1.amazonaws.com/files.galaxydigital.com/4849/agency/59023.jpg?20250430211112',
    'https://www.rehab.com/wp-content/uploads/2024/09/sound-capitol-hill-seattle-wa-98122-front-entrance-696x392.webp',
    'https://togethercenter.org/wp-content/uploads/2021/03/SoundGenerationsLogoWEB_small.jpeg',
    'https://images.pikeplacemarket.org/wp-content/uploads/2021/09/21073006/market_resident-pike_place_market-800x600-1.jpg',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmlrkEgd6jufZGszq4JzWfmqCXR6UVmvEo8g&s',
    'https://www.elcentrodelaraza.org/wp-content/uploads/2023/01/20160826_smr_prm_1113_1600x900.jpg',
    'https://s14621.pcdn.co/wp-content/uploads/2021/08/Solid-Ground-Social.jpg',
    'https://i0.wp.com/alimentandoalpueblo.org/wp-content/uploads/2021/05/AAP_Logo_ClearBackgroun.png?fit=300%2C300&ssl=1',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPEBDiZ7gZ57EQ0vaxFuOE0gwFv7HPOm05Kg&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhXpnE7fCeVDMWR3T1PKQ17GK5qSyCKOYMOw&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQY_CFG7BBQbw3G8L9sNBmyfRwEtTNFnfDlIw&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRX0pYH2E8x5xHqoBc54ITSvKuBTwXnTO4Ngg&s',
    'https://www.dshs.wa.gov/sites/default/files/DSHS_new_logo_2024_home.png',
    'https://media.licdn.com/dms/image/v2/D4E0BAQEd5o-eyOs4-g/company-logo_200_200/company-logo_200_200/0/1698087658460/hopelinkbh_logo?e=2147483647&v=beta&t=3m2_0UcjPt6xGonwRPbtZ_OUF2c-d7SX2UV1SEUQhlQ',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRO6uVLZo-RWfxTuVFyKQkgn6yZIX8zOcvspw&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9v6GNdF7L0tk_4TPPP0LNzwnLwyY64vTPqQ&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3pdjW6e9JUaB3OeCLWmGKL_4neyu6cLj_GA&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzLTuGU0RTPtAQD-f5GeNRK5qFzvPEKX054w&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNaTHjaMCsgVkap57CJ8mTvvsXbOiT2DhnbQ&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUgLspupUoqjWxOw0Qs0GVe3B2nCbB7YQkPQ&s',
    'https://cdn.greatnonprofits.org/images/logos/Ryther_Logo_wTag_RGB.jpg',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvybhd_bW-PSBRO6Inhw1mcq3ShUfkG8z3Tg&s',
    'https://worksourceswwa.com/wp-content/uploads/logo.png',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOBsCR22sF8SEjsgajILec5z_GIQrhbya8ZA&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRHyklZ4ZTxvKHmkKnF3xWuagtmw3UG0Bz4A&s',
    'https://pioneerhumanservices.org/wp-content/uploads/2025/11/PHS-Logo-Horizontal-Blue.png',
    'https://content.govdelivery.com/attachments/fancy_images/WADVA/2023/03/7247347/overlay_original.png',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYK-qWNgNfFq5R86uC58xvDNdRlNa5BL_0_Q&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmZEXHNuAomxYZZl1Svbm6ZudUrdzNgFFaJQ&s',
    'https://s3.us-east-1.amazonaws.com/files.galaxydigital.com/4849/agency/77071.jpg?20230808192630',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQA-r-cC3O38f8S5mjRL4hFgeFkltkibLtipQ&s',
    'https://www.soundtransit.org/sites/default/files/2018-10/web-brand-logo-vertical-blue-rgb.png',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbsDqU8bXhmzEzzzq0kfPBPuhx0JKb_9U5pg&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS627Jj9traYaZqs4aFeJbCKIE1r0I-P96QFg&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-h5ae5XjfJkBc082RrD3ZKUHHhA6twDjavQ&s',
    'https://pbs.twimg.com/profile_images/1379110109352062977/RrOYxqIA_400x400.jpg',
    'https://urbanleague.org/wp-content/uploads/2019/06/MetropolitanSeattle.png',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTONHTbQAj9gZ0EQs3_7vbykVk9EtUXoXLpQw&s',
    'https://www.seattlecolleges.edu/sites/seattlecolleges.southseattle.edu/files/inline-images/seattle-central-tigers-transparentbk259x200.png',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRw4PmsBpkIweOFgzgYK3TdL-M-ZezbjT0ymQ&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQS-Q4FhNyHm7KF8S5SbYMbBRakYlVHl7cleA&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYB4Z-T-xfovIPiUCFjMqR9lnCSlQHxOhBSw&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaL3VZeC4II-orZEwmmHIaQCMAIUSSzU85eA&s',
    'https://giveit2goodwill.org/wp-content/uploads/2021/06/Header-CareerSolutions-Mobile.jpg',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpSUScBORzezLbD222X_4R8WCKm6v1kC7QfQ&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNU96ux87s5bjFbYKf9Ts4RhQrDzQiSiL5Ow&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAvOvGQZQ5T9idM_0eC7TvxloZT2SSu1u1Kw&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjbDZgY_ncDrjjwXtu_axN4UXFUF8UMiIosw&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZCAQYBQgoZhUqvm5yXnXIqc-bRUK0ovs8Sg&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdhOkz8S80NYrlijlh9lWocTTrw-YIGFaGLQ&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpS8LvMR3HQXGwMau-yd-IJUFwwmcJacRA&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSetPGhWY8RregLU2v3Td_yT0k-DvpGE1W8-Q&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPEcZlIBYBfq4W3iEK8to3l1P4prk41GVCfg&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiEZhFkpEvFJ8iCMnejUrntqwQgKKM2OGOqg&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXMlw_TtVzo8pvAMh9ozkV1QL3OV3f6F7zMw&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLpng8Iu3gLwNsJwNgMYsRCbpncmzr-oMdfQ&s',
    'https://www.fenwa.org/images/fenwa-panel-logo.jpg',
    'https://i0.wp.com/kindering.org/wp-content/uploads/2015/11/Kindering_Logo.fw_-e1446826649252.png?fit=500%2C308&ssl=1',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSx4kU97nDcWc-3Psl1810xX5sXdR43xdA-Cw&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVnSXpveVEHOI7XQXFfybD56QyDly2fqrHWw&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWqAIO2Rmj6wnm23IH_OVMRie3eIMeLoYRmw&s',
    'https://www.compasshousingalliance.org/wp-content/uploads/2019/12/CHA-logo2-square-large.png',
    'https://a.mktgcdn.com/p/F6QT8G4zgj-3JcgqdbHoPh9gVaHuphrd9O_DSm226Jc/720x720.png',
    'https://pacmtn.org/wp-content/uploads/2017/12/pacmtn-logo-full-color-rgb.png',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLWzTxLhehTXmFpilsSuob6-0UFjdrcpOhkQ&s',
    'https://images.squarespace-cdn.com/content/v1/533dcf7ce4b0f92a7a64292e/1655418599117-WTM828SSRPRBOLUA2NNU/LCYC_logo.png',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9dt180vKQ9-gOiCHAdmwRoS8j1ZCyeHVmGQ&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTM2GcMretvOAklr3Bdsbfx8x3oldtnPZAokA&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTCxHm5sKg1D-I18kgvXIFDdtHZ8mCO69zOA&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcgzFN7cwRMEuwVOgJeSD3_YGey-FDvXPtow&s'
  ];

  return (
    <div className="min-h-screen bg-transparent">
      <ContainerScroll
        titleComponent={
          <div className="mb-12 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-foreground drop-shadow-sm mb-4 uppercase tracking-tighter">
              {t('references.title')}
            </h1>
            <p className="text-xl text-blue-300 font-bold italic">
              {t('references.subtitle')}
            </p>
          </div>
        }
      >
        <div className="space-y-12 pb-10">
          {/* Professional Documents Section */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <GlassCard hover className="flex flex-col items-center text-center p-8 bg-blue-500/10 border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
              <FileText className="w-12 h-12 text-blue-400 mb-4" />
              <h2 className="text-xl font-bold text-foreground drop-shadow-sm mb-4">{t('references.workLog')}</h2>
              <a
                href="/documents/work-log.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 rounded-xl text-white transition-all font-bold shadow-sm"
              >
                {t('references.viewWorkLog')}
              </a>
            </GlassCard>

            <GlassCard hover className="flex flex-col items-center text-center p-8 bg-amber-500/10 border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
              <Download className="w-12 h-12 text-amber-500 mb-4" />
              <h2 className="text-xl font-bold text-foreground drop-shadow-sm mb-4">{t('references.copyright')}</h2>
              <a
                href="/documents/copyright-checklist.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/30 rounded-xl text-white transition-all font-bold shadow-sm"
              >
                {t('references.viewChecklist')}
              </a>
            </GlassCard>
          </section>

          {/* Project Information */}
          <div className="bg-card/40 rounded-2xl p-8 border border-border backdrop-blur-md">
            <h2 className="text-2xl font-black text-foreground drop-shadow-sm mb-6 flex items-center gap-2 border-b border-border pb-2 uppercase tracking-widest">
              <Info className="w-6 h-6 text-blue-400" /> {t('references.projectInfo')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-300">
               <div>
                  <h3 className="font-bold text-blue-300 mb-2 uppercase tracking-wider text-xs">{t('references.labels.event')}</h3>
                  <p className="font-bold text-lg text-foreground">{t('references.labels.eventValue')}</p>
               </div>
               <div>
                  <h3 className="font-bold text-blue-500 dark:text-blue-300 mb-2 uppercase tracking-wider text-xs">{t('references.labels.chapter')}</h3>
                  <p className="font-bold text-lg text-foreground">{t('references.labels.chapterValue')}</p>
               </div>
               <div>
                  <h3 className="font-bold text-blue-500 dark:text-blue-300 mb-2 uppercase tracking-wider text-xs">{t('references.labels.theme')}</h3>
                  <p className="font-bold text-lg text-foreground">{t('references.labels.themeValue')}</p>
               </div>
            </div>
          </div>


          {/* Other Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Tech Stack */}
            <div className="bg-card/40 rounded-2xl p-8 border border-border backdrop-blur-md">
              <h2 className="text-2xl font-black text-foreground drop-shadow-sm mb-6 border-b border-border pb-2 uppercase tracking-widest">{t('references.techStack')}</h2>
              <ul className="space-y-4">
                {techStack.map((item, i) => (
                  <li key={i} className="flex justify-between items-center text-muted-foreground">
                    <span className="text-foreground font-bold text-sm tracking-tight">{item.category}</span>
                    <span className="text-xs italic font-bold text-indigo-500 dark:text-indigo-400 text-right ml-4">{item.tech}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Libraries */}
            <div className="bg-card/40 rounded-2xl p-8 border border-border backdrop-blur-md">
              <h2 className="text-2xl font-black text-foreground drop-shadow-sm mb-6 border-b border-border pb-2 uppercase tracking-widest">{t('references.libraries')}</h2>
              <ul className="space-y-4">
                {additionalLibraries.map((lib, i) => (
                  <li key={i} className="flex justify-between items-center text-muted-foreground">
                    <span className="text-indigo-600 dark:text-indigo-300 font-mono text-xs font-bold">{lib.name}</span>
                    <span className="text-xs italic font-bold text-right ml-4">{lib.purpose}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Organization Links */}
          <div className="bg-card/40 rounded-2xl p-8 border border-border backdrop-blur-md">
            <h2 className="text-2xl font-black text-foreground drop-shadow-sm mb-6 border-b border-border pb-2 uppercase tracking-widest">{t('references.citations')}</h2>
            <div className="grid grid-cols-1 gap-4">
              {resourceLinks.map((org, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-3 rounded-lg bg-background/50 border border-border hover:bg-background/80 transition-colors">
                  <span className="text-foreground text-sm font-bold uppercase tracking-tight">{org.title}</span>
                  <a
                    href={org.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 dark:text-blue-400 hover:text-blue-600 transition-colors truncate font-black tracking-tighter"
                  >
                    {org.url}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Image Credits */}
          <div className="bg-card/40 rounded-2xl p-8 border border-border backdrop-blur-md">
            <h2 className="text-2xl font-black text-foreground drop-shadow-sm mb-6 border-b border-border pb-2 uppercase tracking-widest">Image Credits</h2>
            <div className="grid grid-cols-1 gap-2 max-h-[500px] overflow-y-auto">
              {imageCredits.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 dark:text-blue-400 hover:text-blue-600 transition-colors truncate font-bold"
                >
                  {url}
                </a>
              ))}
            </div>
          </div>
        </div>
      </ContainerScroll>
    </div>
  );
}
