import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Kebijakan Privasi | Lume Studio',
  description: 'Kebijakan Privasi dan Perlindungan Data Lume Studio.',
}

export default function PrivacyPolicyPage() {
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

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Kebijakan Privasi</h1>

        <div className="prose prose-green max-w-none text-gray-600 space-y-6">
          <p>
            <strong>Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}</strong>
          </p>

          <p>
            Selamat datang di Lume Studio. Kami sangat menghargai privasi Anda dan berkomitmen
            untuk melindungi data pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami
            mengumpulkan, menggunakan, dan melindungi informasi saat Anda menggunakan layanan
            chatbot otomatisasi WhatsApp kami ("Layanan").
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
            1. Informasi yang Kami Kumpulkan
          </h2>
          <p>Kami dapat mengumpulkan jenis informasi berikut:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Informasi Akun:</strong> Nama, alamat email, nomor telepon, dan detail bisnis
              saat Anda mendaftar Layanan kami.
            </li>
            <li>
              <strong>Data Operasional:</strong> Template pesan, kontak pelanggan Anda, dan log
              percakapan yang diproses melalui sistem kami untuk tujuan otomatisasi AI.
            </li>
            <li>
              <strong>Data Teknis:</strong> Alamat IP, jenis browser, dan informasi analitik
              penggunaan saat Anda mengakses dashboard kami.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
            2. Penggunaan Informasi
          </h2>
          <p>Kami menggunakan informasi yang dikumpulkan untuk:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Menyediakan, memelihara, dan meningkatkan Layanan kami.</li>
            <li>Melatih pengaturan AI khusus (hanya menggunakan data bisnis Anda sendiri).</li>
            <li>Memproses transaksi dan mengirimkan pemberitahuan terkait akun.</li>
            <li>Mencegah aktivitas penipuan dan menjaga keamanan sistem (anti-phishing).</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
            3. Perlindungan & Keamanan Data
          </h2>
          <p>
            Keamanan data Anda adalah prioritas kami. Semua data percakapan pelanggan dari bisnis
            Anda diamankan dalam database multi-tenant dengan Row Level Security (RLS). Kami tidak
            menjual atau membagikan data Anda kepada pihak ketiga untuk tujuan pemasaran.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
            4. Hubungi Kami
          </h2>
          <p>
            Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami melalui
            nomor WhatsApp atau email dukungan administrator Anda.
          </p>
        </div>
      </div>
    </div>
  )
}
