
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { X, Key, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiKeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ApiKeys {
  openai: string[];
  gemini: string[];
  groq: string[];
  openrouter: string[];
}

const ApiKeyDialog = ({ isOpen, onClose }: ApiKeyDialogProps) => {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openai: [''],
    gemini: [''],
    groq: [''],
    openrouter: ['']
  });
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set(['openrouter']));
  const { toast } = useToast();

  // Load existing keys when dialog opens
  useEffect(() => {
    if (isOpen) {
      const loadedKeys: ApiKeys = {
        openai: JSON.parse(localStorage.getItem('openai_api_keys') || '[""]'),
        gemini: JSON.parse(localStorage.getItem('gemini_api_keys') || '[""]'),
        groq: JSON.parse(localStorage.getItem('groq_api_keys') || '[""]'),
        openrouter: JSON.parse(localStorage.getItem('openrouter_api_keys') || '[""]')
      };

      setApiKeys(loadedKeys);

      // Expand providers that have valid keys
      const expanded = new Set<string>();
      if (loadedKeys.openrouter.some(key => key.trim())) {
        expanded.add('openrouter');
      }
      if (loadedKeys.groq.some(key => key.trim())) {
        expanded.add('groq');
      }
      if (loadedKeys.gemini.some(key => key.trim())) {
        expanded.add('gemini');
      }
      if (loadedKeys.openai.some(key => key.trim())) {
        expanded.add('openai');
      }
      if (expanded.size === 0) {
        expanded.add('openrouter');
      }
      setExpandedProviders(expanded);
    }
  }, [isOpen]);

  const toggleProviderExpanded = (provider: string) => {
    const newExpanded = new Set(expandedProviders);
    if (newExpanded.has(provider)) {
      newExpanded.delete(provider);
    } else {
      newExpanded.add(provider);
    }
    setExpandedProviders(newExpanded);
  };

  const addKeyField = (provider: 'openai' | 'gemini' | 'groq' | 'openrouter') => {
    if (apiKeys[provider].length < 5) {
      setApiKeys(prev => ({
        ...prev,
        [provider]: [...prev[provider], '']
      }));
    }
  };

  const removeKeyField = (provider: 'openai' | 'gemini' | 'groq' | 'openrouter', index: number) => {
    if (apiKeys[provider].length > 1) {
      setApiKeys(prev => ({
        ...prev,
        [provider]: prev[provider].filter((_, i) => i !== index)
      }));
    }
  };

  const updateKey = (provider: 'openai' | 'gemini' | 'groq' | 'openrouter', index: number, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: prev[provider].map((key, i) => i === index ? value : key)
    }));
  };

  const toggleShowKey = (provider: string, index: number) => {
    const keyId = `${provider}-${index}`;
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const handleSave = () => {
    // Clear old single-key format to avoid conflicts
    localStorage.removeItem('openai_api_key');
    localStorage.removeItem('gemini_api_key');
    localStorage.removeItem('groq_api_key');
    localStorage.removeItem('openrouter_api_key');
    localStorage.removeItem('nvidia_api_key');

    // Save all providers' keys (preserve existing ones, update modified ones)
    const providers = ['openai', 'gemini', 'groq', 'openrouter'] as const;
    let totalKeysSaved = 0;

    providers.forEach(provider => {
      const validKeys = apiKeys[provider].filter(key => key.trim());
      if (validKeys.length > 0) {
        localStorage.setItem(`${provider}_api_keys`, JSON.stringify(validKeys));
        totalKeysSaved += validKeys.length;
      } else {
        // Remove if no valid keys
        localStorage.removeItem(`${provider}_api_keys`);
      }
    });

    if (totalKeysSaved > 0) {
      toast({
        title: "API Keys Saved",
        description: `Your API keys (${totalKeysSaved} total) have been saved successfully. The system will use the best available provider for each request.`,
      });
    } else {
      toast({
        title: "No API Keys",
        description: "Please add at least one API key to use the chat functionality.",
      });
    }

    onClose();
  };

  const handleClear = () => {
    localStorage.removeItem('openai_api_key');
    localStorage.removeItem('gemini_api_key');
    localStorage.removeItem('groq_api_key');
    localStorage.removeItem('openrouter_api_key');
    localStorage.removeItem('nvidia_api_key');
    localStorage.removeItem('openai_api_keys');
    localStorage.removeItem('gemini_api_keys');
    localStorage.removeItem('groq_api_keys');
    localStorage.removeItem('openrouter_api_keys');
    setApiKeys({
      openai: [''],
      gemini: [''],
      groq: [''],
      openrouter: ['']
    });
    setSelectedProvider('openrouter');
    
    toast({
      title: "API Keys Cleared",
      description: "All API keys have been removed.",
    });
  };

  const getActiveKeys = (provider?: 'openai' | 'gemini' | 'groq' | 'openrouter'): number => {
    if (provider) {
      return apiKeys[provider].filter(key => key.trim()).length;
    }
    // Count total active keys across all providers
    let total = 0;
    (['openai', 'gemini', 'groq', 'openrouter'] as const).forEach(p => {
      total += apiKeys[p].filter(key => key.trim()).length;
    });
    return total;
  };

  const hasAnyActiveKeys = () => {
    return (['openai', 'gemini', 'groq', 'openrouter'] as const).some(
      provider => apiKeys[provider].some(key => key.trim())
    );
  };

  const renderKeyInputs = (provider: 'openai' | 'gemini' | 'groq' | 'openrouter', placeholder: string, color: string) => {
    return (
      <div className="space-y-3">
        {apiKeys[provider].map((key, index) => (
          <div key={index} className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showKeys[`${provider}-${index}`] ? "text" : "password"}
                placeholder={`${placeholder} ${index + 1}`}
                value={key}
                onChange={(e) => updateKey(provider, index, e.target.value)}
                className="bg-[#1a1a1a] border-gray-600 text-white placeholder-gray-500 focus:border-white pr-10"
              />
              <button
                type="button"
                onClick={() => toggleShowKey(provider, index)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showKeys[`${provider}-${index}`] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {apiKeys[provider].length > 1 && (
              <Button
                type="button"
                onClick={() => removeKeyField(provider, index)}
                variant="outline"
                size="sm"
                className="bg-[#1a1a1a] border-gray-600 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        {apiKeys[provider].length < 5 && (
          <Button
            type="button"
            onClick={() => addKeyField(provider)}
            variant="outline"
            size="sm"
            className={`bg-[#1a1a1a] border-gray-600 text-${color}-400 hover:bg-${color}-500/10 hover:text-${color}-300`}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Key ({apiKeys[provider].length}/5)
          </Button>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0b0b0b] border-gray-800 p-0 overflow-hidden max-w-2xl" style={{
        borderRadius: '20px',
        maxHeight: '80vh'
      }}>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <DialogHeader className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-white" />
                <DialogTitle className="text-white text-xl">API Keys Management</DialogTitle>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-gray-300 text-sm">Add API keys for one or more providers. The system will automatically use the best available option:</p>

              <div className="space-y-4">
                {/* OpenRouter Option */}
                <div className={`border rounded-lg transition-colors ${
                  expandedProviders.has('openrouter')
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}>
                  <button
                    onClick={() => toggleProviderExpanded('openrouter')}
                    className="w-full p-4 flex items-center gap-3 justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      <label className="text-white font-medium cursor-pointer">OpenRouter API Keys</label>
                      {getActiveKeys('openrouter').length > 0 && (
                        <span className="text-orange-400 text-xs bg-orange-500/20 px-2 py-1 rounded">
                          {getActiveKeys('openrouter').length} key(s)
                        </span>
                      )}
                    </div>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedProviders.has('openrouter') ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>
                  {expandedProviders.has('openrouter') && (
                    <div className="px-4 pb-4 space-y-3 border-t border-orange-500/20">
                      {renderKeyInputs('openrouter', 'sk-or-v1-...', 'orange')}
                      <p className="text-gray-400 text-sm">Access Claude, GPT, Llama, and 200+ models with lower costs. Get your API keys from openrouter.ai</p>
                    </div>
                  )}
                </div>

                {/* OpenAI Option */}
                <div className={`border rounded-lg transition-colors ${
                  expandedProviders.has('openai')
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}>
                  <button
                    onClick={() => toggleProviderExpanded('openai')}
                    className="w-full p-4 flex items-center gap-3 justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      <label className="text-white font-medium cursor-pointer">OpenAI API Keys</label>
                      {getActiveKeys('openai').length > 0 && (
                        <span className="text-blue-400 text-xs bg-blue-500/20 px-2 py-1 rounded">
                          {getActiveKeys('openai').length} key(s)
                        </span>
                      )}
                    </div>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedProviders.has('openai') ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>
                  {expandedProviders.has('openai') && (
                    <div className="px-4 pb-4 space-y-3 border-t border-blue-500/20">
                      {renderKeyInputs('openai', 'sk-...', 'blue')}
                      <p className="text-gray-400 text-sm">Get your API keys from platform.openai.com</p>
                    </div>
                  )}
                </div>

                {/* Gemini Option */}
                <div className={`border rounded-lg transition-colors ${
                  expandedProviders.has('gemini')
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}>
                  <button
                    onClick={() => toggleProviderExpanded('gemini')}
                    className="w-full p-4 flex items-center gap-3 justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      <label className="text-white font-medium cursor-pointer">Google Gemini API Keys</label>
                      {getActiveKeys('gemini').length > 0 && (
                        <span className="text-cyan-400 text-xs bg-cyan-500/20 px-2 py-1 rounded">
                          {getActiveKeys('gemini').length} key(s)
                        </span>
                      )}
                    </div>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedProviders.has('gemini') ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>
                  {expandedProviders.has('gemini') && (
                    <div className="px-4 pb-4 space-y-3 border-t border-cyan-500/20">
                      {renderKeyInputs('gemini', 'AIza...', 'cyan')}
                      <p className="text-gray-400 text-sm">Get your API keys from aistudio.google.com</p>
                    </div>
                  )}
                </div>

                {/* Groq Option */}
                <div className={`border rounded-lg transition-colors ${
                  expandedProviders.has('groq')
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}>
                  <button
                    onClick={() => toggleProviderExpanded('groq')}
                    className="w-full p-4 flex items-center gap-3 justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      <label className="text-white font-medium cursor-pointer">Groq API Keys</label>
                      {getActiveKeys('groq').length > 0 && (
                        <span className="text-green-400 text-xs bg-green-500/20 px-2 py-1 rounded">
                          {getActiveKeys('groq').length} key(s)
                        </span>
                      )}
                    </div>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedProviders.has('groq') ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>
                  {expandedProviders.has('groq') && (
                    <div className="px-4 pb-4 space-y-3 border-t border-green-500/20">
                      {renderKeyInputs('groq', 'gsk_...', 'green')}
                      <p className="text-gray-400 text-sm">Get your API keys from console.groq.com</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                className="flex-1 bg-white text-black hover:bg-gray-200"
                disabled={!hasAnyActiveKeys()}
              >
                Save API Keys ({getActiveKeys()})
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                className="bg-[#1a1a1a] border-gray-600 text-white hover:bg-[#2a2a2a]"
              >
                Clear All
              </Button>
            </div>

            <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700">
              <p className="text-gray-300 text-sm">
                <strong>Failover System:</strong> If your primary API key hits its limit or fails, the system will automatically try the next available key. 
                Your keys are stored locally and only used for direct API calls.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyDialog;
