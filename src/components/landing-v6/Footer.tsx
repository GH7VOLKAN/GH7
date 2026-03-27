import Link from "next/link";

export default function Footer() {
  return (
    <footer className="v6-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <Link href="/" className="logo">GH7<span>.ai</span></Link>
          <p className="footer-tagline">Yapay zeka gorunurluk platformu.</p>
        </div>
        <div className="footer-cols">
          <div className="footer-col">
            <h4>Cozumler</h4>
            <ul>
              <li><a href="#test">Ucretsiz Audit</a></li>
              <li><a href="#pricing">Fiyatlar</a></li>
              <li><a href="#cozum">Paketler</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Platform</h4>
            <ul>
              <li><a href="#">Dashboard</a></li>
              <li><a href="#">API</a></li>
              <li><a href="#">Entegrasyonlar</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Kaynaklar</h4>
            <ul>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Dokumantasyon</a></li>
              <li><a href="#">Destek</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>&copy; 2025 GH7.ai &mdash; Tum haklari saklidir.</span>
        <div className="footer-legal">
          <a href="#">Gizlilik</a>
          <a href="#">Kullanim Sartlari</a>
        </div>
      </div>
    </footer>
  );
}
