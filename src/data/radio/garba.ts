import type { RadioTrack } from '@/types/radio';

// Garba, raas, Gujarati folk and modern Gujarati film music.
//
// Tracks carrying a videoId were derived from the rights holder's own upload
// via scripts/fetch-pool.mjs + scripts/suggest-catalog.mjs, so both the id and
// the spelling come from the label rather than from memory.
//
// Tracks still on `videoId: null` are songs known to exist that the current
// source pool does not cover: Hindi-film garba crossovers live on the Hindi
// label channels, and traditional standards have many recorded versions with
// no single canonical upload, so a preferred recording has to be chosen
// deliberately rather than guessed.
export const garbaTracks: RadioTrack[] = [
  // --- Falguni Pathak (Universal Music India / Revibe official uploads) ---
  { title: 'Maine Payal Hai Chhankai', artist: 'Falguni Pathak', year: 1999, videoId: 'Rbz1qFlRL_Y' },
  { title: 'Yaad Piya Ki Aane Lagi', artist: 'Falguni Pathak', year: 1999, videoId: 'jnubod5MEUI' },
  { title: 'Meri Chunar Udd Udd Jaye', artist: 'Falguni Pathak', year: 2000, videoId: '4V2SU8LMXxo' },
  { title: 'Chudi', artist: 'Falguni Pathak', year: 1998, videoId: 'NdMdXYAvP9A' },
  { title: 'O Piya', artist: 'Falguni Pathak', year: 2001, videoId: 'GuXZxK-Y56I' },
  { title: 'Indhana Winva', artist: 'Falguni Pathak', year: 1998, videoId: 'hNAvRwuamfA' },
  { title: 'Yeh Kisne Jadu Kiya', artist: 'Falguni Pathak', videoId: '36pUFsAj_70' },
  { title: 'Saawan Mein', artist: 'Falguni Pathak', videoId: 'VRNiSc0vmB4' },
  { title: 'Aiyo Rama', artist: 'Falguni Pathak', videoId: 'Dzcxq4tVpIE' },
  { title: 'Mera Kajal', artist: 'Falguni Pathak', videoId: 'lueiOVv4FUQ' },
  { title: 'Pal Pal Teri Yaad', artist: 'Falguni Pathak', videoId: 'W9jDkapPgKo' },
  { title: 'Mithe Ras Se', artist: 'Falguni Pathak', videoId: 'LvFqHd805co' },
  { title: 'Aisi Laagi Lagan Piya Se', artist: 'Falguni Pathak', videoId: 'cBXuLW0fEd8' },
  { title: 'Ankhon Mein Tu', artist: 'Falguni Pathak', videoId: 'NrwJYYVOI9o' },
  { title: 'Rut Ne Jo Bansi Bajayi', artist: 'Falguni Pathak', videoId: 'wB3L1vbIHbE' },
  { title: 'Aayee Pardes Se', artist: 'Falguni Pathak', videoId: 'L15xaZWZ5Pw' },
  { title: 'Mehndi Hathon Mein', artist: 'Falguni Pathak', videoId: 'SB4OvGrQPr4' },
  { title: 'Aayi Re Milan Root', artist: 'Falguni Pathak', videoId: '0lkpch8xGyk' },
  { title: 'Jhoom Jhoom', artist: 'Falguni Pathak', videoId: 'OoGawm0Fyc4' },

  // --- Aditya Gadhvi (official channel uploads) ---
  { title: 'Khalasi', artist: 'Aditya Gadhvi, Achint', album: 'Coke Studio Bharat', year: 2023, videoId: 't7wSjy9Lv-o' },
  { title: 'Mor Bani Thangat Kare', artist: 'Aditya Gadhvi', videoId: '5pYoLr_naO0' },
  { title: 'Naagar Nandji Na Laal', artist: 'Aditya Gadhvi', videoId: 'iraezTzB938' },
  { title: 'Latke Halo', artist: 'Aditya Gadhvi', videoId: 'beBmY38f_M0' },
  { title: 'Albeli Matwali Maiyya', artist: 'Aditya Gadhvi', videoId: 'aHaqb45sNn8' },
  { title: 'Jalalo Bilalo', artist: 'Aditya Gadhvi', videoId: '4YZjkaACB3o' },
  { title: 'Main Kanuda Tori Govalan', artist: 'Aditya Gadhvi', videoId: 'c1B01ds2ASY' },
  { title: 'Saaybo Maro Gulab No Chhod', artist: 'Aditya Gadhvi', videoId: 'yhXOowUnjTE' },
  { title: 'Jai Aadhyashakti', artist: 'Aditya Gadhvi', videoId: 'WWHY5Hj9r3E' },
  { title: 'Aavi Rudi Ajwaali Raat', artist: 'Aditya Gadhvi', videoId: 'zRQkYZYCpUc' },
  { title: 'Vaatadiyu', artist: 'Aditya Gadhvi', videoId: 'PSEsliFe6zQ' },
  { title: 'Mahahetvali', artist: 'Aditya Gadhvi', videoId: '3gUqUA00myo' },
  { title: 'Akhand Roji', artist: 'Aditya Gadhvi', videoId: 'mtgE0SyYvhE' },
  { title: 'Thanganaat Thobhshe Na', artist: 'Aditya Gadhvi', videoId: '76HoPjVOi7A' },
  { title: 'Rakt Tapakti', artist: 'Aditya Gadhvi', videoId: 'VrvqdAqqz2Y' },
  { title: 'Virangana Vardivali', artist: 'Aditya Gadhvi', videoId: 'SXiZfisE_9I' },
  { title: 'Madhratu Na Mor', artist: 'Aditya Gadhvi', videoId: 'Y3DGMJBxzBo' },
  { title: 'Rang Bhini Radha', artist: 'Aditya Gadhvi', videoId: 'JYLEyMvj6sE' },

  // --- Hindi-film garba crossovers (await a Hindi-label source expansion) ---
  { title: 'Chogada', artist: 'Darshan Raval, Asees Kaur', album: 'Loveyatri', year: 2018, videoId: 'yr7JFNsz5dU' },
  { title: 'Dholida', artist: 'Shreya Ghoshal, Janhvi Shrimankar', album: 'Gangubai Kathiawadi', year: 2022, videoId: 'Jh_VKJAEnUY' },
  { title: 'Nagada Sang Dhol', artist: 'Shreya Ghoshal, Osman Mir', album: 'Goliyon Ki Raasleela Ram-Leela', year: 2013, videoId: 'OVE2MII5KU8' },
  { title: 'Udi Udi Jaye', artist: 'Sukhwinder Singh, Bhoomi Trivedi', album: 'Raees', year: 2017, videoId: '3rTdFFrPrEg' },
  { title: 'Kamariya', artist: 'Darshan Raval, Lijo George', album: 'Mitron', year: 2018, videoId: 'MhPNBN9knIk' },
  { title: 'Dholi Taro Dhol Baaje', artist: 'Kavita Krishnamurthy, Vinod Rathod', album: 'Hum Dil De Chuke Sanam', year: 1999, videoId: '4a25J3p0kVI' },
  { title: 'Vhalam Aavo Ne', artist: 'Jigardan Gadhavi', album: 'Love Ni Bhavai', year: 2017, videoId: '5gIpqS-Qpzw' },
  { title: 'Chaand Ne Kaho', artist: 'Jigardan Gadhavi', album: 'Chaal Jeevi Laiye', year: 2019, videoId: '_N-A7PIUy2Y' },

  // --- Traditional garba and raas standards (pick a recording deliberately) ---
  { title: 'Pankhida O Pankhida', artist: 'Traditional', videoId: '5cAISqItql8' },
  { title: 'Tara Vina Shyam', artist: 'Traditional', videoId: 'JJjKcSLDV8M' },
  { title: 'Sanedo', artist: 'Maniraj Barot', videoId: '2l-JHpsRVJE' },
  { title: 'Rangtaali Rangtaali', artist: 'Traditional', videoId: 'LEOs_IM3YN8' },
  { title: 'Hu To Gai Ti Mele', artist: 'Traditional', videoId: '72Ewgso05vk' },
  { title: 'Gori Radha Ne Kalo Kaan', artist: 'Traditional', videoId: 'ccqg6e2rfLU' },
];
