import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ProfileImageUpload } from "@/components/auth/ProfileImageUpload";
import { PrivacyPolicy } from "@/components/auth/PrivacyPolicy";
import { TermsConditions } from "@/components/auth/TermsConditions";
import { allCountries } from "@/data/westAfricaData";
import { Eye, EyeOff, ArrowLeft, MapPin } from "lucide-react";
import ayokaLogo from "@/assets/ayoka-logo.png";
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(location.state?.mode !== 'signup');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsConditions, setShowTermsConditions] = useState(false);
  
  // Use refs for text inputs to avoid re-renders on every keystroke
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  // Keep state only for select fields and avatar (which need to trigger UI updates)
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Field-level validation errors
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    country?: string;
    phone?: string;
  }>({});

  const selectedCountry = allCountries.find((c) => c.code === country);
  const dialCode = selectedCountry?.dialCode || "";

  // Real-time validation functions
  const validateFirstName = (value: string): string | undefined => {
    if (!value.trim()) return "Le prénom est requis";
    if (value.trim().length < 2) return "Le prénom doit contenir au moins 2 caractères";
    return undefined;
  };

  const validateLastName = (value: string): string | undefined => {
    if (!value.trim()) return "Le nom est requis";
    if (value.trim().length < 2) return "Le nom doit contenir au moins 2 caractères";
    return undefined;
  };

  const validateEmail = (value: string): string | undefined => {
    if (!value.trim()) return "L'email est requis";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) return "Format email invalide (ex: exemple@email.com)";
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) return "Le mot de passe est requis";
    if (value.length < 6) return "Minimum 6 caractères requis";
    return undefined;
  };

  const validateConfirmPassword = (value: string, password: string): string | undefined => {
    if (!value) return "Veuillez confirmer votre mot de passe";
    if (value !== password) return "Les mots de passe ne correspondent pas";
    return undefined;
  };

  const validatePhone = (value: string): string | undefined => {
    if (!value.trim()) return "Le téléphone est requis";
    if (value.trim().length < 6) return "Numéro de téléphone invalide";
    return undefined;
  };

  // Handlers for real-time validation
  const handleFieldBlur = (field: string, value: string) => {
    let error: string | undefined;
    
    switch (field) {
      case 'firstName':
        error = !isLogin ? validateFirstName(value) : undefined;
        break;
      case 'lastName':
        error = !isLogin ? validateLastName(value) : undefined;
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        // Also revalidate confirm password if it has a value
        if (!isLogin && confirmPasswordRef.current?.value) {
          const confirmError = validateConfirmPassword(confirmPasswordRef.current.value, value);
          setFieldErrors(prev => ({ ...prev, confirmPassword: confirmError }));
        }
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(value, passwordRef.current?.value || "");
        break;
      case 'phone':
        error = !isLogin ? validatePhone(value) : undefined;
        break;
    }
    
    setFieldErrors(prev => ({ ...prev, [field]: error }));
  };

  // Clear field error when user starts typing
  const handleFieldChange = (field: string) => {
    if (fieldErrors[field as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Fonction pour détecter la localisation manuellement
  const detectLocation = async () => {
    if (!('geolocation' in navigator)) {
      toast({
        title: "Géolocalisation non disponible",
        description: "Votre navigateur ne supporte pas la géolocalisation",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Détection en cours...",
      description: "Veuillez autoriser l'accès à votre localisation",
    });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
          );
          const data = await response.json();
          
          const detectedCity = data.address?.city || data.address?.town || data.address?.village || null;
          const detectedCountry = data.address?.country || null;
          
          if (detectedCountry) {
            const matchingCountry = allCountries.find(c => 
              c.name.toLowerCase() === detectedCountry.toLowerCase()
            );
            if (matchingCountry) {
              setCountry(matchingCountry.code);
              setCity(detectedCity || "");
              toast({
                title: "Localisation détectée !",
                description: `${detectedCity}, ${detectedCountry}`,
              });
            } else {
              toast({
                title: "Pays non trouvé",
                description: "Veuillez sélectionner votre pays manuellement",
                variant: "destructive",
              });
            }
          }
        } catch (error) {
          console.error('Error fetching location details:', error);
          toast({
            title: "Erreur de détection",
            description: "Impossible de détecter votre localisation",
            variant: "destructive",
          });
        }
      },
      (error) => {
        console.log('Geolocation permission denied:', error);
        // Ne pas afficher de toast d'erreur - l'utilisateur peut sélectionner manuellement
      }
    );
  };

  // La détection de localisation est maintenant manuelle uniquement (bouton)
  // pour éviter les blocages réseau au chargement de la page

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Fonction de validation email
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Fonction pour traduire les erreurs Supabase
  const getErrorMessage = (error: any): string => {
    const errorMessage = error?.message?.toLowerCase() || "";
    
    if (errorMessage.includes("invalid login credentials")) {
      return "Email ou mot de passe incorrect. Vérifiez vos identifiants.";
    }
    if (errorMessage.includes("email not confirmed")) {
      return "Votre email n'a pas encore été confirmé. Vérifiez votre boîte de réception.";
    }
    if (errorMessage.includes("user already registered")) {
      return "Un compte existe déjà avec cet email. Essayez de vous connecter.";
    }
    if (errorMessage.includes("password should be at least")) {
      return "Le mot de passe doit contenir au moins 6 caractères.";
    }
    if (errorMessage.includes("email rate limit exceeded")) {
      return "Trop de tentatives. Veuillez réessayer dans quelques minutes.";
    }
    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      return "Erreur de connexion. Vérifiez votre connexion internet.";
    }
    if (errorMessage.includes("invalid email")) {
      return "L'adresse email saisie n'est pas valide.";
    }
    
    return error?.message || "Une erreur inattendue s'est produite. Veuillez réessayer.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Get values from refs
    const email = emailRef.current?.value?.trim() || "";
    const password = passwordRef.current?.value || "";
    const confirmPassword = confirmPasswordRef.current?.value || "";
    const firstName = firstNameRef.current?.value?.trim() || "";
    const lastName = lastNameRef.current?.value?.trim() || "";
    const phone = phoneRef.current?.value?.trim() || "";

    try {
      // Validation email pour login et signup
      if (!email) {
        toast({
          title: "Email requis",
          description: "Veuillez saisir votre adresse email.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!isValidEmail(email)) {
        toast({
          title: "Email invalide",
          description: "Veuillez saisir une adresse email valide (ex: exemple@email.com).",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!password) {
        toast({
          title: "Mot de passe requis",
          description: "Veuillez saisir votre mot de passe.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (isLogin) {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur AYOKA MARKET !",
        });
        navigate("/");
      } else {
        // Sign up validation - Prénom
        if (!firstName) {
          toast({
            title: "Prénom requis",
            description: "Veuillez saisir votre prénom.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        if (firstName.length < 2) {
          toast({
            title: "Prénom trop court",
            description: "Le prénom doit contenir au moins 2 caractères.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // Validation - Nom
        if (!lastName) {
          toast({
            title: "Nom requis",
            description: "Veuillez saisir votre nom de famille.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        if (lastName.length < 2) {
          toast({
            title: "Nom trop court",
            description: "Le nom doit contenir au moins 2 caractères.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // Validation - Pays
        if (!country) {
          toast({
            title: "Pays requis",
            description: "Veuillez sélectionner votre pays.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // Validation - Mot de passe
        if (password.length < 6) {
          toast({
            title: "Mot de passe trop court",
            description: "Le mot de passe doit contenir au moins 6 caractères pour votre sécurité.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // Validation - Confirmation mot de passe
        if (!confirmPassword) {
          toast({
            title: "Confirmation requise",
            description: "Veuillez confirmer votre mot de passe.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          toast({
            title: "Mots de passe différents",
            description: "Les deux mots de passe saisis ne correspondent pas. Vérifiez votre saisie.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // Validation - Conditions
        if (!acceptTerms) {
          toast({
            title: "Conditions non acceptées",
            description: "Vous devez accepter les politiques de confidentialité et les conditions générales pour créer un compte.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        const fullPhone = phone ? `${dialCode}${phone}` : "";

        // Sign up - Envoyer TOUTES les données dans raw_user_meta_data
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              first_name: firstName,
              last_name: lastName,
              full_name: `${firstName} ${lastName}`,
              phone: fullPhone,
              avatar_url: avatarUrl,
              country: selectedCountry?.name,
              city: city,
            },
          },
        });

        if (error) throw error;

        if (!data.user) {
          throw new Error("Erreur lors de la création du compte. Veuillez réessayer.");
        }
        
        // Send verification email
        try {
          const confirmationUrl = `${window.location.origin}/auth/confirm`;
          const emailResult = await supabase.functions.invoke('send-verification-email', {
            body: {
              email,
              confirmationUrl,
              userName: firstName
            }
          });
          if (emailResult.error) {
            console.error("Error sending verification email:", emailResult.error);
          } else {
            console.log("Verification email sent successfully");
          }
        } catch (emailError) {
          console.error("Error sending verification email:", emailError);
        }

        toast({
          title: "Compte créé avec succès !",
          description: "Vérifiez votre email pour obtenir votre badge vérifié ✓",
        });
        navigate("/");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        title: "Erreur d'authentification",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Clear refs when switching between login/signup
  const handleModeSwitch = () => {
    setIsLogin(!isLogin);
    setAcceptTerms(false);
    setFieldErrors({});
    // Clear input values
    if (emailRef.current) emailRef.current.value = "";
    if (passwordRef.current) passwordRef.current.value = "";
    if (confirmPasswordRef.current) confirmPasswordRef.current.value = "";
    if (firstNameRef.current) firstNameRef.current.value = "";
    if (lastNameRef.current) lastNameRef.current.value = "";
    if (phoneRef.current) phoneRef.current.value = "";
  };

  // Hide keyboard programmatically
  const hideKeyboard = useCallback(async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await Keyboard.hide();
      } catch (e) {
        // Fallback to blur
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement) activeElement.blur();
      }
    }
  }, []);

  // Dismiss keyboard when tapping outside inputs on iOS
  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.closest('button') || target.closest('[role="combobox"]');
    
    if (!isInput) {
      hideKeyboard();
    }
  }, [hideKeyboard]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-muted/30"
      onClick={handleContainerClick}
    >
      <div className="w-full max-w-2xl">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="mb-4"
          aria-label="Retour"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img 
                src={ayokaLogo} 
                alt="AYOKA MARKET" 
                className="h-16 w-auto object-contain"
              />
            </div>
            <CardTitle className="text-2xl">
              {isLogin ? "Connexion" : "Créer un compte"}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? "Connectez-vous à votre compte AYOKA MARKET"
                : "Rejoignez la communauté AYOKA MARKET"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <>
                  <ProfileImageUpload
                    value={avatarUrl}
                    onChange={setAvatarUrl}
                    disabled={isLoading}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        ref={firstNameRef}
                        defaultValue=""
                        placeholder="Jean"
                        required
                        disabled={isLoading}
                        className={fieldErrors.firstName ? "border-destructive" : ""}
                        onBlur={(e) => handleFieldBlur('firstName', e.target.value)}
                        onChange={() => handleFieldChange('firstName')}
                      />
                      {fieldErrors.firstName && (
                        <p className="text-xs text-destructive">{fieldErrors.firstName}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        ref={lastNameRef}
                        defaultValue=""
                        placeholder="Dupont"
                        required
                        disabled={isLoading}
                        className={fieldErrors.lastName ? "border-destructive" : ""}
                        onBlur={(e) => handleFieldBlur('lastName', e.target.value)}
                        onChange={() => handleFieldChange('lastName')}
                      />
                      {fieldErrors.lastName && (
                        <p className="text-xs text-destructive">{fieldErrors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="country">Pays *</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={detectLocation}
                        disabled={isLoading}
                        className="h-8 gap-2 text-xs"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        <span>Détecter ma position</span>
                      </Button>
                    </div>
                    <Select
                      value={country}
                      onValueChange={(value) => {
                        setCountry(value);
                        setCity("");
                      }}
                      required
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un pays" />
                      </SelectTrigger>
                      <SelectContent>
                        {allCountries.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            <span className="flex items-center gap-2">
                              <span className="text-xl">{c.flag}</span>
                              {c.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {country && (
                    <div className="space-y-2">
                      <Label htmlFor="city">Ville *</Label>
                      <Select
                        value={city}
                        onValueChange={setCity}
                        required
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une ville" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedCountry?.cities.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label htmlFor="phone">Téléphone *</Label>
                    <div className="flex gap-2">
                      <Input
                        value={dialCode}
                        disabled
                        className="w-24 bg-muted"
                      />
                      <Input
                        id="phone"
                        type="tel"
                        ref={phoneRef}
                        defaultValue=""
                        placeholder="771234567"
                        required
                        disabled={isLoading || !country}
                        className={fieldErrors.phone ? "border-destructive" : ""}
                        onInput={(e) => {
                          const target = e.target as HTMLInputElement;
                          target.value = target.value.replace(/\D/g, "");
                        }}
                        onBlur={(e) => handleFieldBlur('phone', e.target.value)}
                        onChange={() => handleFieldChange('phone')}
                      />
                    </div>
                    {fieldErrors.phone && (
                      <p className="text-xs text-destructive">{fieldErrors.phone}</p>
                    )}
                  </div>
                </>
              )}

              <div className="space-y-1">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  ref={emailRef}
                  defaultValue=""
                  placeholder="exemple@email.com"
                  required
                  disabled={isLoading}
                  inputMode="email"
                  autoComplete={isLogin ? "email" : "email"}
                  enterKeyHint="next"
                  className={fieldErrors.email ? "border-destructive" : ""}
                  onBlur={(e) => handleFieldBlur('email', e.target.value)}
                  onChange={() => handleFieldChange('email')}
                />
                {fieldErrors.email && (
                  <p className="text-xs text-destructive">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="password">Mot de passe *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    ref={passwordRef}
                    defaultValue=""
                    placeholder="Votre mot de passe"
                    required
                    disabled={isLoading}
                    minLength={6}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    enterKeyHint={isLogin ? "done" : "next"}
                    className={fieldErrors.password ? "border-destructive" : ""}
                    onBlur={(e) => handleFieldBlur('password', e.target.value)}
                    onChange={() => handleFieldChange('password')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {fieldErrors.password && (
                  <p className="text-xs text-destructive">{fieldErrors.password}</p>
                )}
                {isLogin && (
                  <div className="text-right mt-1">
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-sm text-muted-foreground hover:text-primary"
                      onClick={() => navigate("/forgot-password")}
                    >
                      Mot de passe oublié ?
                    </Button>
                  </div>
                )}
              </div>

              {!isLogin && (
                <div className="space-y-1">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      ref={confirmPasswordRef}
                      defaultValue=""
                      placeholder="Confirmez le mot de passe"
                      required
                      disabled={isLoading}
                      minLength={6}
                      className={fieldErrors.confirmPassword ? "border-destructive" : ""}
                      onBlur={(e) => handleFieldBlur('confirmPassword', e.target.value)}
                      onChange={() => handleFieldChange('confirmPassword')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                      aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-xs text-destructive">{fieldErrors.confirmPassword}</p>
                  )}
                </div>
              )}

              {!isLogin && (
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                    disabled={isLoading}
                    className="mt-1"
                  />
                  <div className="text-sm leading-none">
                    <label
                      htmlFor="terms"
                      className="text-muted-foreground cursor-pointer"
                    >
                      J'accepte les{" "}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowPrivacyPolicy(true);
                        }}
                        className="text-primary hover:underline font-medium"
                      >
                        politiques de confidentialité
                      </button>
                      {" "}et les{" "}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowTermsConditions(true);
                        }}
                        className="text-primary hover:underline font-medium"
                      >
                        conditions générales
                      </button>
                    </label>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading
                  ? "Chargement..."
                  : isLogin
                  ? "Se connecter"
                  : "Créer mon compte"}
              </Button>

              <div className="text-center pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">
                  {isLogin
                    ? "Pas encore de compte ?"
                    : "Déjà un compte ?"}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleModeSwitch}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLogin ? "Créer un compte" : "Se connecter"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <PrivacyPolicy open={showPrivacyPolicy} onOpenChange={setShowPrivacyPolicy} />
      <TermsConditions open={showTermsConditions} onOpenChange={setShowTermsConditions} />
    </div>
  );
};

export default Auth;
