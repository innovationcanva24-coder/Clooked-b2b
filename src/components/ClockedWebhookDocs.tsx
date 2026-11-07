import React, { useState } from 'react';
import {
  Code,
  Copy,
  Check,
  Send,
  Zap,
  Globe,
  Lock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Terminal,
} from 'lucide-react';

export const ClockedWebhookDocs: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testPayloadText, setTestPayloadText] = useState(`FACTURE
DevOps Agile Consulting
N° Facture : DEV-2026-9901
Date : 06/11/2026
TVA Intracommunautaire : FR77112233445
Prestation informatique : 5 166,67 € HT
TVA (20%) : 1 033,33 €
Total TTC à payer : 6 200,00 €`);

  const [simulatedResponse, setSimulatedResponse] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const CLOCKED_PROMPT_SCHEMA = {
    instruction:
      "Analyse le texte extrait de ce document de facturation. Extraits de manière stricte les informations demandées sans ajouter de texte périphérique. Convertis le montant en valeur numérique et formate la TVA.",
    schema: {
      fournisseur_nom: "Le nom de l'entreprise émettrice",
      numero_tva: "Le numéro de TVA intracommunautaire ou identifiant fiscal",
      montant_ttc: "Le montant total de la facture (nombre décimal)",
      numero_facture: "L'identifiant unique de la facture",
    },
  };

  const APPSHEET_WEBHOOK_CONFIG = {
    url: "https://api.clocked.io/v1/documents/extract",
    http_method: "POST",
    http_headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer clk_live_948a3f89b94098492efb",
      "X-Clocked-App-Origin": "AppSheet-Automation-Bot",
    },
    appsheet_payload_template: JSON.stringify(
      {
        document_url: '<<[Fichier_PDF]>>',
        instruction: CLOCKED_PROMPT_SCHEMA.instruction,
        schema: CLOCKED_PROMPT_SCHEMA.schema,
      },
      null,
      2
    ),
  };

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    await new Promise((r) => setTimeout(r, 650));

    // Extraction parsing
    let nom = "DevOps Agile Consulting";
    let tva = "FR77112233445";
    let montant = 6200.00;
    let numFac = "DEV-2026-9901";

    if (testPayloadText.toLowerCase().includes("cloudscale")) {
      nom = "CloudScale Infra SAS";
      tva = "FR12345678901";
      montant = 3890.00;
      numFac = "INV-2026-945";
    }

    setSimulatedResponse({
      status: "success",
      confidence: 0.99,
      processing_time_ms: 320,
      extracted_data: {
        fournisseur_nom: nom,
        numero_tva: tva,
        montant_ttc: montant,
        numero_facture: numFac,
      },
      appsheet_mapping: {
        "[Fournisseur_Nom]": nom,
        "[Numero_TVA]": tva,
        "[Montant_Extrait]": montant,
        "[Numero_Facture]": numFac,
        "Formule_Statut_Resultat": montant === 6200.00 ? "Approuvé (Vert)" : "Bloqué (Rouge)",
      },
    });
    setIsSimulating(false);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Intro Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Schéma de Branchement HTTP & Intégration Clocked / AppSheet
              </h1>
              <p className="text-xs text-slate-400">
                Guide complet de configuration pour le passage à l'oral et le déploiement de l'automate.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
              Proxy Serveur : /api/clocked/extract
            </span>
          </div>
        </div>
      </div>

      {/* Section 1 : Le Prompt d'extraction Clocked demandé */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              1. Prompt & Schéma d'Instruction JSON (Corps de la requête Clocked)
            </h2>
          </div>
          <button
            onClick={() => copyToClipboard(JSON.stringify(CLOCKED_PROMPT_SCHEMA, null, 2), 'prompt')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
          >
            {copiedKey === 'prompt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'prompt' ? 'Copié !' : 'Copier JSON'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          À intégrer dans l'onglet <strong className="text-white">Automation</strong> d'AppSheet (Tâche <em>&quot;Call a Webhook&quot;</em>) déclenchée lorsqu'un fichier PDF est ajouté à la table <code className="text-emerald-400 font-mono">Factures_Recues</code> :
        </p>

        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed">
{JSON.stringify(CLOCKED_PROMPT_SCHEMA, null, 2)}
        </pre>
      </div>

      {/* Section 2 : Règle de validation AppSheet */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              2. La Règle de Validation Automatique (AppSheet Formula)
            </h2>
          </div>
          <button
            onClick={() => copyToClipboard('IF([Montant_Extrait] = [Montant_Attendu], "Approuvé", "Bloqué")', 'formula')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
          >
            {copiedKey === 'formula' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'formula' ? 'Copié !' : 'Copier Formule'}</span>
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-sm text-emerald-300 flex items-center justify-between">
          <span>IF([Montant_Extrait] = [Montant_Attendu], &quot;Approuvé&quot;, &quot;Bloqué&quot;)</span>
          <span className="text-xs font-sans px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 font-semibold">
            Validation Instantanée
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-slate-300 space-y-1">
            <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Passage au Vert (&quot;Approuvé&quot;)</span>
            </div>
            <p>
              Dès que Clocked extrait le montant et qu'il est strictement égal au montant autorisé sur le Bon de Commande de la Base ERP, le statut passe en vert sans action humaine.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-slate-300 space-y-1">
            <div className="font-semibold text-rose-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              <span>Passage au Rouge (&quot;Bloqué&quot;)</span>
            </div>
            <p>
              En cas de surcoût, de frais cachés ou de discordance de montant, l'application bloque immédiatement la facture pour prévenir tout décaissement indû.
            </p>
          </div>
        </div>
      </div>

      {/* Section 3 : Schéma HTTP exact (URL, Headers, cURL) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">
              3. Schéma de Branchement HTTP Exact (Headers & Webhook)
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-slate-400 font-sans font-semibold">Méthode & URL Endpoint :</div>
            <div className="text-cyan-400 font-bold">POST https://api.clocked.io/v1/documents/extract</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-slate-400 font-sans font-semibold">Headers HTTP obligatoires :</div>
            <div className="text-slate-300 space-y-1">
              <div>Content-Type: application/json</div>
              <div>Authorization: Bearer &lt;CLOCKED_API_TOKEN&gt;</div>
              <div>X-Clocked-Webhook: true</div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-slate-400" />
              Exemple de commande cURL pour tester l'API Clocked :
            </span>
            <button
              onClick={() => copyToClipboard(`curl -X POST "https://api.clocked.io/v1/documents/extract" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer clk_live_demo_token" \\
  -d '${JSON.stringify(CLOCKED_PROMPT_SCHEMA)}'`, 'curl')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              {copiedKey === 'curl' ? 'Copié !' : 'Copier cURL'}
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-850 text-slate-300 font-mono text-xs overflow-x-auto leading-relaxed">
{`curl -X POST "https://api.clocked.io/v1/documents/extract" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer clk_live_demo_token" \\
  -d '${JSON.stringify(CLOCKED_PROMPT_SCHEMA, null, 2)}'`}
          </pre>
        </div>
      </div>

      {/* Section 4 : Simulateur en Direct de l'extraction */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              4. Bac à Sable / Simulateur Interactif Clocked
            </h2>
          </div>
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSimulating ? 'Extraction en cours...' : 'Tester la réponse API'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Entrez le texte brut extrait d'un document ou cliquez directement sur Tester pour observer la réponse JSON générée selon le schéma strict.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Document brut d'entrée (PDF Text Layer)
            </label>
            <textarea
              rows={7}
              value={testPayloadText}
              onChange={(e) => setTestPayloadText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Réponse JSON retournée par l'API Clocked
            </label>
            <div className="w-full h-[154px] bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-emerald-400 overflow-y-auto">
              {simulatedResponse ? (
                <pre>{JSON.stringify(simulatedResponse, null, 2)}</pre>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 italic">
                  Cliquez sur &quot;Tester la réponse API&quot; pour afficher le JSON retourné
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
