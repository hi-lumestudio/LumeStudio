import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Syarat & Ketentuan | Lume Studio',
  description: 'Syarat dan Ketentuan layanan Lume Studio.',
}

export default function TermsConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-[family-name:var(--font-inter)]">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Syarat & Ketentuan</h1>

        <div className="prose prose-green max-w-none text-gray-600 space-y-6">
          <p>
            <strong>Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}</strong>
          </p>

          <p>
            Dengan mendaftar dan menggunakan layanan Lume Studio ("Layanan"), Anda menyetujui
            untuk terikat pada Syarat dan Ketentuan berikut ("Perjanjian"). Harap baca dengan
            saksama sebelum menggunakan Layanan kami.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
            1. Deskripsi Layanan
          </h2>
          <p>
            Lume Studio ("Kami") menyediakan platform perangkat lunak sebagai layanan (SaaS)
            yang memungkinkan pengguna ("Anda" atau "Bisnis") untuk mengotomatisasi interaksi
            pelanggan menggunakan kecerdasan buatan melalui WhatsApp Business API dan dashboard web.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
            2. Penggunaan yang Diizinkan
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Anda setuju untuk menggunakan Layanan hanya untuk tujuan bisnis yang sah.</li>
            <li>Anda bertanggung jawab penuh atas semua pesan yang dikirim dari akun Anda.</li>
            <li>
              Anda dilarang menggunakan platform ini untuk mengirim spam, konten ilegal,
              penipuan (phishing), atau materi yang melanggar kebijakan WhatsApp (Meta).
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
            3. Kewajiban Pengguna
          </h2>
          <p>
            Anda bertanggung jawab untuk menjaga kerahasiaan kata sandi dan akun Anda. Lume Studio
            tidak bertanggung jawab atas kerugian atau kerusakan yang timbul dari kegagalan Anda
            untuk mematuhi kewajiban keamanan ini.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
            4. Kebijakan Berlangganan dan Pembayaran
          </h2>
          <p>
            Layanan ini ditagih di awal berdasarkan paket bulanan yang Anda pilih. Semua pembayaran
            tidak dapat dikembalikan, kecuali ditentukan lain oleh hukum yang berlaku atau
            kesepakatan langsung antara Anda dan pihak Lume Studio.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
            5. Penafian Jaminan
          </h2>
          <p>
            Layanan disediakan "sebagaimana adanya". Kami tidak menjamin bahwa Layanan tidak
            akan terganggu atau bebas kesalahan. Penggunaan API pihak ketiga (seperti WhatsApp)
            bergantung pada ketersediaan dan kebijakan pihak tersebut.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
            6. Perubahan Syarat
          </h2>
          <p>
            Kami berhak untuk memperbarui Perjanjian ini kapan saja tanpa pemberitahuan
            sebelumnya. Penggunaan terus-menerus Anda atas Layanan setelah perubahan
            merupakan persetujuan terhadap Syarat yang baru.
          </p>
        </div>
      </div>
    </div>
  )
}
