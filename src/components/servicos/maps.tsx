export default function Mapa() {
  return (
    <div className="w-full">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3571.045964208354!2d-48.978961824480535!3d-26.486464876903856!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94dec1a2465d452d%3A0x50ee8aab8ee30b04!2sEst%C3%A9tica%20Hanna%20Kupas!5e0!3m2!1spt-PT!2sbr!4v1781218087160!5m2!1spt-PT!2sbr"
        width="100%"
        height="450"
        style={{ border: 0, display: "block" }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        title="Localização"
      ></iframe>
    </div>
  );
}
