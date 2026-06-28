export default function Footer() {
  return (
    <footer className="w-full bg-ring text-white">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div>
          <h3 className="text-xl font-semibold text-primary! mb-3">
            Estética Hanna Kupas
          </h3>
          <p className="text-sm leading-relaxed">
            Serviços de estética facial e corporal, massoterapia...
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-primary! uppercase mb-3">
            Contato
          </h4>
          <ul className="space-y-2 text-sm">
            <li>📍 R. Bartolomeu Spezia, 470 | Guaramirim - SC</li>
            <li>📞 (47) 99707-4991</li>
            <li>✉️ contato@suaclinica.com</li>
            <li>🕒 Seg a Sáb: 09h às 19h</li>
          </ul>
        </div>

        {/* Redes sociais */}
        <div>
          <h4 className="text-sm font-semibold text-primary! uppercase mb-3">
            Redes Sociais
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="https://www.instagram.com/hannakupasestetica/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/5547997074991"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                WhatsApp
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com/esteticahannakupas/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Facebook
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="py-4">
        <span className="text-center text-sm text-primary">
          © {new Date().getFullYear()} Estética Hanna Kupas. Todos os direitos
          reservados.
        </span>
      </div>
    </footer>
  );
}
