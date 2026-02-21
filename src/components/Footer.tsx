import { Package, Calendar, Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from "lucide-react";

export function Footer() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const fullDate = today.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <footer className="bg-[#0e71b4] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 text-2xl font-bold mb-4">
              <Package className="w-6 h-6" />
              <span>Shop.tn</span>
            </div>
            <p className="text-sm text-white/80 mb-4">
              Votre destination shopping en Tunisie. Des milliers de produits
              aux meilleurs prix, livraison rapide partout dans le pays.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-white hover:text-white/80">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-white hover:text-white/80">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-white hover:text-white/80">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">LIENS UTILES</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li><a href="#" className="hover:text-white">À propos de Shop.tn</a></li>
              <li><a href="#" className="hover:text-white">Conditions de vente</a></li>
              <li><a href="#" className="hover:text-white">Livraison et retours</a></li>
              <li><a href="#" className="hover:text-white">Paiement sécurisé</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">CATÉGORIES</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li><a href="#" className="hover:text-white">Électronique</a></li>
              <li><a href="#" className="hover:text-white">Mode & Accessoires</a></li>
              <li><a href="#" className="hover:text-white">Maison & Jardin</a></li>
              <li><a href="#" className="hover:text-white">Sports & Loisirs</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">CONTACT</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>service@shop.tn</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+216 25 739 698</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Tunis, Tunisie</span>
              </li>
            </ul>
          </div>
        </div>

        {/* COPYRIGHT WITH FULL DATE */}
        <div className="text-center mt-12 pt-8 border-t border-white/20 text-sm text-white/70">
          Shop.tn © {currentYear} - Tous droits réservés 
          <br className="block sm:hidden" /> 
          Created by Nour yahyaoui in{" "}
          <Calendar className="inline w-3 h-3 mr-1" />
          <span className="font-medium">{fullDate}</span>
        </div>
      </div>
    </footer>
  );
}