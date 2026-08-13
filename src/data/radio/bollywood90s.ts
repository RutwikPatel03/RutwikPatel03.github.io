import type { RadioTrack } from '@/types/radio';

// The cassette era. Hindi film music roughly 1988 to 2001, the stuff that
// actually played in barbershops, truck cabins and highway dhabas.
//
// Every entry resolves to an official label upload. Titles that could not be
// paired with a clean single-song upload were dropped rather than left
// pending: what YouTube holds for that era is mostly jukebox compilations,
// and a silent entry is worse than a shorter station.
//
// moods places a song into one or more day-parted rotations:
//   classics - mid-tempo, all-day barbershop listening
//   raat     - late night, distance, separation, long empty roads
//   dard     - the heartbreak half of the decade
//   shaadi   - wedding-procession energy, the loud happy side
export const bollywood90sTracks: RadioTrack[] = [
  { title: 'Kuch Kuch Hota Hai', artist: 'Udit Narayan, Alka Yagnik', album: 'Kuch Kuch Hota Hai', year: 1998, videoId: 'UnZPDYuD29U', moods: ['classics'] },
  { title: 'Ladki Badi Anjani Hai', artist: 'Kumar Sanu, Alka Yagnik', album: 'Kuch Kuch Hota Hai', year: 1998, videoId: 'oJcE_QPFAng', moods: ['classics'] },
  { title: 'Koi Mil Gaya', artist: 'Udit Narayan, Alka Yagnik', album: 'Kuch Kuch Hota Hai', year: 1998, videoId: 'gmXlGQAg400', moods: ['shaadi'] },
  { title: 'Aati Kya Khandala', artist: 'Aamir Khan, Alka Yagnik', album: 'Ghulam', year: 1998, videoId: 'C5kihXiyHfE', moods: ['shaadi'] },
  { title: 'Ole Ole', artist: 'Abhijeet', album: 'Yeh Dillagi', year: 1994, videoId: 'AnRrg0oePpc', moods: ['shaadi'] },
  { title: 'Husn Hai Suhana', artist: 'Abhijeet, Chandana Dixit', album: 'Coolie No. 1', year: 1995, videoId: 'svZPpCAxTQM', moods: ['shaadi'] },
  { title: 'Sona Kitna Sona Hai', artist: 'Poornima, Vinod Rathod', album: 'Hero No. 1', year: 1997, videoId: '4pIV63BLA6A', moods: ['shaadi'] },
  { title: 'Raah Mein Unse', artist: 'Kumar Sanu, Alka Yagnik', album: 'Vijaypath', year: 1994, videoId: 'dDR4oiyjUBA', moods: ['classics'] },

  { title: 'Pardesi Pardesi', artist: 'Udit Narayan, Alka Yagnik', album: 'Raja Hindustani', year: 1996, videoId: 'C985cmfZv6U', moods: ['dard', 'raat'] },
  { title: 'Tu Pyar Hai Kisi Aur Ka', artist: 'Kumar Sanu, Anuradha Paudwal', album: 'Dil Hai Ke Manta Nahin', year: 1991, videoId: 'pmyyujwe73M', moods: ['dard'] },
  { title: 'Nazar Ke Samne', artist: 'Kumar Sanu, Anuradha Paudwal', album: 'Aashiqui', year: 1990, videoId: 'wrKndqHFNaQ', moods: ['classics', 'dard'] },
  { title: 'Dheere Dheere Se', artist: 'Kumar Sanu, Anuradha Paudwal', album: 'Aashiqui', year: 1990, videoId: 'pKsD2GiQhOo', moods: ['classics'] },
  { title: 'Ab Tere Bin', artist: 'Kumar Sanu', album: 'Aashiqui', year: 1990, videoId: 'rTatsmUgmiA', moods: ['dard', 'raat'] },
  { title: 'Main Duniya Bhula Doonga', artist: 'Kumar Sanu, Anuradha Paudwal', album: 'Aashiqui', year: 1990, videoId: 'otQmzlm-s7Q', moods: ['dard'] },
  { title: 'Tu Meri Zindagi Hai', artist: 'Kumar Sanu, Anuradha Paudwal', album: 'Aashiqui', year: 1990, videoId: 'oEg_iXEWlt4', moods: ['classics'] },
  { title: 'Rangeela Re', artist: 'Asha Bhosle', album: 'Rangeela', year: 1995, videoId: 'YtxRYsivodA', moods: ['shaadi'] },
  { title: 'Tanha Tanha', artist: 'Asha Bhosle', album: 'Rangeela', year: 1995, videoId: '8OCW33wbIlI', moods: ['classics'] },
  { title: 'Hai Rama', artist: 'Hariharan, Swarnalatha', album: 'Rangeela', year: 1995, videoId: 'y8k_SfJKVdo', moods: ['raat'] },
  { title: 'Taal Se Taal Mila', artist: 'Udit Narayan, Alka Yagnik', album: 'Taal', year: 1999, videoId: '8YqerfkvzyA', moods: ['shaadi'] },
  { title: 'Ishq Bina', artist: 'Sonu Nigam, Anuradha Sriram', album: 'Taal', year: 1999, videoId: 'zSCevtX7ud0', moods: ['classics'] },
  { title: 'Kahin Aag Lage', artist: 'Asha Bhosle, Richa Sharma', album: 'Taal', year: 1999, videoId: '-qlrEgMX7pE', moods: ['shaadi'] },
  { title: 'Chhoti Si Aasha', artist: 'Minmini', album: 'Roja', year: 1992, videoId: 'E4MxRN2ix88', moods: ['classics'] },
  { title: 'Chhod Aaye Hum', artist: 'Hariharan, Suresh Wadkar, K.S. Chithra', album: 'Maachis', year: 1996, videoId: '70YFS4GvuQ0', moods: ['raat'] },
  { title: 'Yeh Dil Deewana', artist: 'Sonu Nigam, Hema Sardesai', album: 'Pardes', year: 1997, videoId: 'KUjswKk5vuM', moods: ['classics'] },
  { title: 'Do Dil Mil Rahe Hain', artist: 'Kumar Sanu', album: 'Pardes', year: 1997, videoId: '6dwrzyr54_U', moods: ['dard', 'raat'] },
  { title: 'Meri Mehbooba', artist: 'Kumar Sanu, Alka Yagnik', album: 'Pardes', year: 1997, videoId: '6hZiMhjSOdk', moods: ['classics'] },
  { title: 'I Love My India', artist: 'Hariharan, Kavita Krishnamurthy, Shankar Mahadevan', album: 'Pardes', year: 1997, videoId: 'VHQ0w-9ITBI', moods: ['shaadi'] },

  { title: 'Ek Ladki Ko Dekha', artist: 'Kumar Sanu', album: '1942: A Love Story', year: 1994, videoId: 'htMvfOfixuM', moods: ['classics'] },
  { title: 'Ek Pal Ka Jeena', artist: 'Lucky Ali', album: 'Kaho Naa Pyaar Hai', year: 2000, videoId: 'aGbPyM6lzBs', moods: ['shaadi'] },
  { title: 'Kaho Naa Pyaar Hai', artist: 'Udit Narayan, Alka Yagnik', album: 'Kaho Naa Pyaar Hai', year: 2000, videoId: '-LESbtPT8uw', moods: ['classics'] },
  { title: 'Dil Ne Dil Ko Pukara', artist: 'Kumar Sanu, Alka Yagnik', album: 'Kaho Naa Pyaar Hai', year: 2000, videoId: 'e3TFNC-FRUA', moods: ['dard'] },
  { title: 'Woh Pehli Baar', artist: 'KK', album: 'Pyaar Mein Kabhi Kabhi', year: 1999, videoId: '-wVvVXLUYFU', moods: ['classics', 'raat'] },

  { title: 'Made In India', artist: 'Alisha Chinai', year: 1995, videoId: 'pi4HDAa2hC8', moods: ['shaadi'] },
  { title: 'O Sanam', artist: 'Lucky Ali', album: 'Sunoh', year: 1996, videoId: 'o6nn78ctKLk', moods: ['raat'] },
  { title: 'Purani Jeans', artist: 'Ali Haider', year: 1995, videoId: 'M8nM8CRDCmI', moods: ['raat', 'classics'] },
  { title: 'Bheegi Bheegi Raaton Mein', artist: 'Adnan Sami', videoId: 'rD_UrVm8RJQ', moods: ['raat'] },
  { title: 'Kabhi To Nazar Milao', artist: 'Adnan Sami, Asha Bhosle', year: 2000, videoId: '84k0Dk1xAdg', moods: ['raat', 'dard'] },
  { title: 'Dooba Dooba', artist: 'Silk Route', year: 1998, videoId: 'wSUlUvCxYQY', moods: ['raat', 'classics'] },
  { title: 'Chandni O Meri Chandni', artist: 'Sridevi', album: 'Chandni', year: 1989, videoId: '7CzIRq9pj_0', moods: ['classics'] },
  { title: 'Achha Sila Diya', artist: 'Sonu Nigam', album: 'Bewafa Sanam', year: 1995, videoId: 'hrZNezQsqIQ', moods: ['dard', 'raat'] },
  { title: 'Ek Sanam Chahiye', artist: 'Kumar Sanu', album: 'Aashiqui', year: 1990, videoId: 'SOTJu_uEYuQ', moods: ['dard'] },
  { title: 'Dil Ka Aalam', artist: 'Kumar Sanu', album: 'Aashiqui', year: 1990, videoId: '42pnRh-ZIrQ', moods: ['dard'] },
  { title: 'Tere Dar Par Sanam', artist: 'Kumar Sanu', album: 'Phir Teri Kahani Yaad Aayee', year: 1993, videoId: '05o4kCUY2Ys', moods: ['dard'] },
  { title: 'Chaha Hai Tujhko', artist: 'Udit Narayan, Anuradha Paudwal', album: 'Mann', year: 1999, videoId: 'SUnD-B1JQZk', moods: ['dard'] },
  { title: 'Zindagi Maut Na Ban Jaye', artist: 'Sonu Nigam', album: 'Sarfarosh', year: 1999, videoId: 'eq2ap7pFQNU', moods: ['dard', 'raat'] },
  { title: 'Hoshwalon Ko Khabar Kya', artist: 'Jagjit Singh', album: 'Sarfarosh', year: 1999, videoId: 'hZuwe72Rtcc', moods: ['raat', 'dard'] },
  { title: 'Is Tarah Aashiqui Ka', artist: 'Kumar Sanu', album: 'Imtihan', year: 1994, videoId: 'T7IZuj5fvYM', moods: ['dard'] },

  { title: 'Tumsa Koi Pyaara', artist: 'Kumar Sanu, Alka Yagnik', album: 'Khuddar', year: 1994, videoId: '3NWMK2MRqIk', moods: ['shaadi'] },
  { title: 'Saaton Janam Main Tere', artist: 'Kumar Sanu, Alka Yagnik', album: 'Dilwale', year: 1994, videoId: 'oFxbBeYhLqM', moods: ['dard'] },
  { title: 'Kitna Haseen Chehra', artist: 'Kumar Sanu, Alka Yagnik', album: 'Dilwale', year: 1994, videoId: 'qGOTe3KmCdY', moods: ['classics'] },
  { title: 'Tumse Milne Ko Dil Karta Hai', artist: 'Kumar Sanu', album: 'Phool Aur Kaante', year: 1991, videoId: '5y_TCKNzAMI', moods: ['classics'] },
  { title: 'Dheere Dheere Pyar Ko Badhana Hai', artist: 'Kumar Sanu, Sadhana Sargam', album: 'Phool Aur Kaante', year: 1991, videoId: 'zuPoUsdXrqM', moods: ['classics'] },
  { title: 'Maine Pyaar Tumhi Se Kiya Hai', artist: 'Kumar Sanu, Alka Yagnik', album: 'Phool Aur Kaante', year: 1991, videoId: 'cTUnhb1LMoE', moods: ['classics'] },
  { title: 'Premi Aashiq Aawaara', artist: 'Kumar Sanu', album: 'Phool Aur Kaante', year: 1991, videoId: 'rMbQufI9xQw', moods: ['shaadi'] },
  { title: 'Bas Ek Sanam Chahiye', artist: 'Kumar Sanu', album: 'Aashiqui', year: 1990, videoId: 'fBylcT-TWZw', moods: ['dard'] },
  { title: 'Chhupana Bhi Nahin Aata', artist: 'Vinod Rathod', album: 'Baazigar', year: 1993, videoId: 'fg9G1dacXjk', moods: ['dard'] },
  { title: 'Paas Woh Aane Lage', artist: 'Kumar Sanu, Alka Yagnik', album: 'Main Khiladi Tu Anari', year: 1994, videoId: 'w89fWEelFns', moods: ['classics'] },
  { title: 'Sab Kuchh Bhula Diya', artist: 'Sonu Nigam, Shreya Ghoshal', album: 'Hum Tumhare Hain Sanam', year: 2002, videoId: 'Q6BxJblqOzo', moods: ['dard'] },
  { title: 'Pehli Pehli Baar Mohabbat Ki Hai', artist: 'Kumar Sanu, Sonu Nigam', album: 'Sirf Tum', year: 1999, videoId: 'cBGDDBHN22U', moods: ['classics'] },

  // --- Added from a curated cassette-era rotation ---
  { title: 'Sochenge Tumhe Pyar', artist: 'Kumar Sanu', album: 'Deewana', year: 1992, videoId: 'lFdSi01tpYM', moods: ['dard'] },
  { title: 'Tumhein Apna Banane Ki Kasam', artist: 'Kumar Sanu, Anuradha Paudwal', album: 'Sadak', year: 1991, videoId: 'tPNwGuu_rQ4', moods: ['dard'] },
  { title: 'Nahin Yeh Ho Nahin Sakta', artist: 'Kumar Sanu, Alka Yagnik', album: 'Barsaat', year: 1995, videoId: 'RjJxWRFfG3s', moods: ['dard'] },
  { title: 'Kya Karte They Sajna', artist: 'Anuradha Paudwal', album: 'Lal Dupatta Malmal Ka', year: 1989, videoId: 'Zi9UBJQMz3I', moods: ['dard', 'raat'] },
  { title: 'Tumse Milna', artist: 'Udit Narayan, Alka Yagnik', album: 'Tere Naam', year: 2003, videoId: '526hvVlBP1U', moods: ['dard'] },
  { title: 'Kyo Kisi Ko', artist: 'Udit Narayan', album: 'Tere Naam', year: 2003, videoId: 'iCZfjggJg3M', moods: ['dard', 'raat'] },
  { title: 'Dil Cheer Ke Dekh', artist: 'Kumar Sanu', album: 'Dil Ka Kya Kasoor', year: 1992, videoId: '9f6GhUb-WdM', moods: ['dard'] },
  { title: 'Aawara Hawa Ka Jhonka Hoon', artist: 'Sonu Nigam', videoId: '-pIMyf5dOnA', moods: ['raat'] },
  { title: 'Hum Lakh Chupaye Pyar Magar', artist: 'Kumar Sanu', videoId: 'wuLJtA0uJro', moods: ['classics'] },
  { title: 'Hum Pyaar Hai Tumhare', artist: 'Kumar Sanu, Alka Yagnik', album: 'Haan Maine Bhi Pyaar Kiya', year: 2002, videoId: '4ImdbyqnH8w', moods: ['classics'] },
];
