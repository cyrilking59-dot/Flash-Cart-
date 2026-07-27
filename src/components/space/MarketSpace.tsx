import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { VOLTA_MARKETS } from '../../data/seedData';
import { VoltaMarketId } from '../../types';
import { ProductDeliveryTrace } from '../common/ProductDeliveryTrace';
import {
  MessageSquare,
  Users,
  TrendingUp,
  Sparkles,
  PlusCircle,
  ThumbsUp,
  MessageCircle,
  Share2,
  MapPin,
  Tag,
  Filter,
  Search,
  Megaphone,
  CheckCircle2,
  Building2,
  Store,
  Calendar,
  Send,
  X,
  Award,
  HelpCircle,
  ShoppingCart,
  Compass,
  Flame,
  ArrowRight,
  ShieldCheck,
  Zap,
  Check
} from 'lucide-react';

interface SpacePost {
  id: string;
  authorName: string;
  authorRole: 'TRADER' | 'CUSTOMER' | 'RIDER' | 'MARKET_OFFICIAL';
  authorAvatar?: string;
  marketId: VoltaMarketId;
  category: 'ANNOUNCEMENT' | 'WHOLESALE' | 'PRICE_UPDATE' | 'BUY_REQUEST' | 'GENERAL';
  title: string;
  content: string;
  priceTag?: string;
  itemImage?: string;
  productName?: string;
  timestamp: string;
  likes: number;
  userLiked?: boolean;
  comments: {
    id: string;
    author: string;
    role: string;
    text: string;
    time: string;
  }[];
  isPinned?: boolean;
}

export const MarketSpace: React.FC = () => {
  const { products, addToCart, setCurrentRole } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedMarketFilter, setSelectedMarketFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const handleQuickAdd = (product: any, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1500);
  };
  
  // Post Creation Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<SpacePost['category']>('GENERAL');
  const [newPostMarket, setNewPostMarket] = useState<VoltaMarketId>('akatsi');
  const [newPostAuthorName, setNewPostAuthorName] = useState('Madam Grace (Trader)');
  const [newPostPriceTag, setNewPostPriceTag] = useState('');

  // Comment Input state
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});

  // Sample Posts Initial Data
  const [posts, setPosts] = useState<SpacePost[]>([
    {
      id: 'p1',
      authorName: 'Akatsi Market Committee',
      authorRole: 'MARKET_OFFICIAL',
      marketId: 'akatsi',
      category: 'ANNOUNCEMENT',
      title: '🚨 Official Market Day Schedule & Road Upgrade Update',
      content: 'Good news to all Gari processing traders and transporters! The main loading park at Akatsi Central Market has completed paving. Market day holds this Saturday with free loading bay access for trucks.',
      timestamp: '2 hours ago',
      likes: 42,
      userLiked: false,
      isPinned: true,
      comments: [
        { id: 'c1', author: 'Kofi Mensah', role: 'Trader', text: 'Excellent update! Are rider dispatch bays fully open as well?', time: '1 hour ago' },
        { id: 'c2', author: 'Official Admin', role: 'Market Official', text: 'Yes Kofi, all rider dispatch spots are active.', time: '45 mins ago' }
      ]
    },
    {
      id: 'p2',
      authorName: 'Mama Beatrice (Gari Processing Hub)',
      authorRole: 'TRADER',
      marketId: 'akatsi',
      category: 'WHOLESALE',
      title: '📦 Wholesale Offer: 50 Bags Extra Fine Yellow Gari (Grade A)',
      content: 'Freshly roasted cassava gari ready for bulk order dispatch to Ho, Accra, or Tema. Wholesale rate at ₵280 per 50kg bag with free market loading.',
      priceTag: '₵280 / 50kg Bag',
      itemImage: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800',
      productName: 'Premium Akatsi Yellow Sugar-Crisp Gari',
      timestamp: '4 hours ago',
      likes: 29,
      userLiked: true,
      comments: [
        { id: 'c3', author: 'Esi Dzifa', role: 'Customer', text: 'Can I combine 3 bags with 1 bag of white gari for one order?', time: '2 hours ago' },
        { id: 'c4', author: 'Mama Beatrice', role: 'Trader', text: 'Yes Esi! Select my stall in the Storefront or place order through Flash Cart.', time: '1 hour ago' }
      ]
    },
    {
      id: 'p3',
      authorName: 'Efo Mawuli (Fisherman & Smoker)',
      authorRole: 'TRADER',
      marketId: 'dabala',
      category: 'PRICE_UPDATE',
      title: '🐟 Fresh Smoked Tilapia & Mudfish Arrival at Dabala Market',
      content: 'Just brought in fresh catch smoked tilapia directly from lower Volta lake landing sites. Prices start from ₵85 per large woven basket.',
      priceTag: '₵85.00 / Basket',
      itemImage: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=800',
      productName: 'Fresh Volta River Tilapia (Jumbo Size)',
      timestamp: '5 hours ago',
      likes: 18,
      userLiked: false,
      comments: [
        { id: 'c5', author: 'Chef Mawusi', role: 'Customer', text: 'Is delivery available to Sogakope by rider?', time: '3 hours ago' }
      ]
    },
    {
      id: 'p4',
      authorName: 'Cyril (Restaurant Owner)',
      authorRole: 'CUSTOMER',
      marketId: 'agbozume',
      category: 'BUY_REQUEST',
      title: '🔍 Looking for Authentic Handwoven Agbozume Kente Strips',
      content: 'Need 10 full ceremonial woven Kente pieces for a wedding event in 3 weeks. Traders with custom patterns please reach out or leave stall location.',
      itemImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=800',
      productName: 'Authentic Handwoven Agbozume Kente Cloth',
      timestamp: '6 hours ago',
      likes: 15,
      userLiked: false,
      comments: [
        { id: 'c6', author: 'Master Weaver Yao', role: 'Trader', text: 'Greetings Cyril! Visit Stall B-14 at Agbozume Market or check my listed store items.', time: '4 hours ago' }
      ]
    }
  ]);

  // Poll state
  const [pollVotedOption, setPollVotedOption] = useState<number | null>(null);
  const [pollVotes, setPollVotes] = useState<number[]>([142, 88, 34]);

  const handleVotePoll = (index: number) => {
    if (pollVotedOption !== null) return;
    const newVotes = [...pollVotes];
    newVotes[index] += 1;
    setPollVotes(newVotes);
    setPollVotedOption(index);
  };

  const handleToggleLike = (postId: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const isLiked = p.userLiked;
          return {
            ...p,
            userLiked: !isLiked,
            likes: isLiked ? p.likes - 1 : p.likes + 1
          };
        }
        return p;
      })
    );
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [
              ...p.comments,
              {
                id: `c_${Date.now()}`,
                author: 'You (Community Member)',
                role: 'Member',
                text,
                time: 'Just now'
              }
            ]
          };
        }
        return p;
      })
    );

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    const newPost: SpacePost = {
      id: `p_${Date.now()}`,
      authorName: newPostAuthorName || 'Volta Trader',
      authorRole: 'TRADER',
      marketId: newPostMarket,
      category: newPostCategory,
      title: newPostTitle,
      content: newPostContent,
      priceTag: newPostPriceTag ? newPostPriceTag : undefined,
      timestamp: 'Just now',
      likes: 1,
      userLiked: true,
      comments: []
    };

    setPosts([newPost, ...posts]);
    setShowCreateModal(false);
    setNewPostTitle('');
    setNewPostContent('');
    setNewPostPriceTag('');
  };

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.authorName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = activeCategory === 'ALL' || post.category === activeCategory;
      const matchesMarket = selectedMarketFilter === 'ALL' || post.marketId === selectedMarketFilter;

      return matchesSearch && matchesCategory && matchesMarket;
    });
  }, [posts, searchQuery, activeCategory, selectedMarketFilter]);

  const totalPollVotes = pollVotes.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      
      {/* Space Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent z-10" />
        <img
          src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=1600"
          alt="Volta Market Community Space"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative z-20 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-full text-xs font-semibold">
            <Users className="w-3.5 h-3.5" />
            <span>Volta Region Market Community & Trader Space</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Connect, Discuss Prices & Trade Together
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            The open digital square for Volta Region merchants, bulk buyers, riders, and customers. Post wholesale supply offers, ask market price questions, get official market day announcements, and arrange group buying!
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Community Post</span>
            </button>

            <button
              onClick={() => setCurrentRole('DIRECTORY')}
              className="bg-slate-950 hover:bg-slate-800 text-amber-300 border border-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Items & Prices Directory</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column Feed (2/3), Right Column Notice Board & Polls (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Feed & Filters) */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Feed Filter Toolbar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            
            {/* Search and Market Location Select */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search community posts, traders, Gari prices..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="w-full sm:w-56">
                <select
                  value={selectedMarketFilter}
                  onChange={e => setSelectedMarketFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="ALL">All 7 Volta Market Spaces</option>
                  {VOLTA_MARKETS.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
              {[
                { id: 'ALL', label: 'All Discussions', icon: <MessageSquare className="w-3.5 h-3.5" /> },
                { id: 'ANNOUNCEMENT', label: 'Announcements', icon: <Megaphone className="w-3.5 h-3.5" /> },
                { id: 'WHOLESALE', label: 'Wholesale & Bulk', icon: <Tag className="w-3.5 h-3.5" /> },
                { id: 'PRICE_UPDATE', label: 'Price Updates', icon: <TrendingUp className="w-3.5 h-3.5" /> },
                { id: 'BUY_REQUEST', label: 'Buyer Requests', icon: <HelpCircle className="w-3.5 h-3.5" /> },
                { id: 'GENERAL', label: 'General Talk', icon: <Users className="w-3.5 h-3.5" /> },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all ${
                    activeCategory === cat.id
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800/80'
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

          </div>

          {/* Posts Feed */}
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="py-16 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No posts match your filters in this Space.</p>
                <p className="text-xs">Be the first to share an update or start a discussion!</p>
              </div>
            ) : (
              filteredPosts.map(post => {
                const marketInfo = VOLTA_MARKETS.find(m => m.id === post.marketId);
                return (
                  <div
                    key={post.id}
                    className={`bg-slate-900 border rounded-2xl p-5 shadow-xl space-y-4 transition-all ${
                      post.isPinned ? 'border-amber-500/50 bg-slate-900/90' : 'border-slate-800'
                    }`}
                  >
                    {/* Header: Author & Market Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center font-black text-amber-400 text-sm">
                          {post.authorName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-white">{post.authorName}</h4>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                              post.authorRole === 'MARKET_OFFICIAL' 
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : post.authorRole === 'TRADER'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            }`}>
                              {post.authorRole.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{post.timestamp}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-amber-400">
                              <MapPin className="w-3 h-3" /> {marketInfo?.name}
                            </span>
                          </div>
                        </div>
                      </div>

                      {post.isPinned && (
                        <div className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                          <Sparkles className="w-3 h-3" /> Pinned
                        </div>
                      )}
                    </div>

                    {/* Post Content */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-black text-white">{post.title}</h3>
                        {post.priceTag && (
                          <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black font-mono px-2.5 py-1 rounded-xl flex-shrink-0">
                            {post.priceTag}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{post.content}</p>

                      {/* Post Market Item Image Attachment */}
                      {post.itemImage && (
                        <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-lg group">
                          <img
                            src={post.itemImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-bold text-white">
                            <span className="bg-slate-950/80 backdrop-blur border border-slate-800 px-3 py-1 rounded-xl text-amber-300">
                              📷 {post.productName || 'Market Item Visual'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Trace: Product -> Market -> Town -> Available Riders */}
                      <ProductDeliveryTrace
                        productName={post.productName || post.title}
                        marketId={post.marketId}
                        compact
                      />
                    </div>

                    {/* Action Bar (Likes & Comments Count) */}
                    <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs text-slate-400">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleToggleLike(post.id)}
                          className={`flex items-center gap-1.5 font-bold transition-all ${
                            post.userLiked ? 'text-amber-400' : 'hover:text-white'
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span>{post.likes} Likes</span>
                        </button>

                        <div className="flex items-center gap-1.5 font-bold text-slate-400">
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.comments.length} Responses</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setCurrentRole('CUSTOMER')}
                        className="text-[11px] text-amber-400 hover:underline font-bold flex items-center gap-1"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" /> Order via Storefront
                      </button>
                    </div>

                    {/* Comments Thread Section */}
                    {post.comments.length > 0 && (
                      <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 space-y-2.5 text-xs">
                        {post.comments.map(comment => (
                          <div key={comment.id} className="border-b border-slate-900 last:border-none pb-2 last:pb-0">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-bold text-slate-200">{comment.author}</span>
                              <span className="text-slate-500">{comment.time}</span>
                            </div>
                            <p className="text-slate-300 text-[11px] mt-0.5">{comment.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment Input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Write a comment or response..."
                        value={commentInputs[post.id] || ''}
                        onChange={e => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                        onKeyDown={e => { if (e.key === 'Enter') handleAddComment(post.id); }}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold transition-all"
                        title="Send Comment"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right Column: Community Notice Board, Polls & Market Highlights */}
        <div className="space-y-5">
          
          {/* Market Poll Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Weekly Market Space Poll</span>
            </div>

            <h4 className="text-xs font-black text-white">
              Which Volta commodity will experience the highest price demand this weekend?
            </h4>

            <div className="space-y-2 text-xs">
              {[
                { label: 'Akatsi Fine Gari (50kg Bags)', count: pollVotes[0] },
                { label: 'Agbozume Ceremonial Kente', count: pollVotes[1] },
                { label: 'Dabala Fresh Lake Tilapia', count: pollVotes[2] },
              ].map((option, idx) => {
                const percentage = totalPollVotes > 0 ? Math.round((option.count / totalPollVotes) * 100) : 0;
                return (
                  <button
                    key={idx}
                    onClick={() => handleVotePoll(idx)}
                    disabled={pollVotedOption !== null}
                    className={`w-full text-left p-3 rounded-xl border transition-all relative overflow-hidden ${
                      pollVotedOption === idx
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    {/* Progress Bar Background */}
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-amber-500/20 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />

                    <div className="relative z-10 flex items-center justify-between font-bold">
                      <span className="text-white text-xs">{option.label}</span>
                      <span className="font-mono text-amber-400 text-xs">{percentage}%</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="text-[10px] text-slate-400 text-right">
              Total Community Votes: <strong className="text-slate-200">{totalPollVotes}</strong>
            </div>
          </div>

          {/* Official Volta Market Days Directory */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Official Market Day Calendar</span>
            </div>

            <div className="space-y-2 divide-y divide-slate-800/80 text-xs">
              {VOLTA_MARKETS.map(market => (
                <div key={market.id} className="pt-2 first:pt-0 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-xs">{market.name}</div>
                    <div className="text-[10px] text-slate-400">{market.district}</div>
                  </div>
                  <span className="text-[10px] bg-slate-950 border border-slate-800 text-amber-300 font-mono px-2 py-1 rounded-lg">
                    {market.marketDays}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Space Guidelines */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2 text-xs text-slate-400">
            <h5 className="font-bold text-white flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> Market Space Rules
            </h5>
            <p className="text-[11px]">
              Keep all price quotes and trader updates accurate to maintain community trust. Instant order dispatches can be fulfilled directly through Flash Cart.
            </p>
          </div>

        </div>

      </div>

      {/* CREATE NEW POST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative animate-fadeIn">
            
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 bg-slate-950 rounded-full border border-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-400" /> Create Community Post
              </h3>
              <p className="text-xs text-slate-400">
                Share wholesale commodity offers, price alerts, or general questions with the Volta community.
              </p>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Your Name / Store Name
                </label>
                <input
                  type="text"
                  required
                  value={newPostAuthorName}
                  onChange={e => setNewPostAuthorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Discussion Category
                  </label>
                  <select
                    value={newPostCategory}
                    onChange={e => setNewPostCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="GENERAL">General Discussion</option>
                    <option value="WHOLESALE">Wholesale Supply</option>
                    <option value="PRICE_UPDATE">Price Update</option>
                    <option value="BUY_REQUEST">Buying Request</option>
                    <option value="ANNOUNCEMENT">Announcement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Market Location
                  </label>
                  <select
                    value={newPostMarket}
                    onChange={e => setNewPostMarket(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    {VOLTA_MARKETS.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Post Headline / Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Fresh Gari supply arriving tomorrow at Stall A-4"
                  value={newPostTitle}
                  onChange={e => setNewPostTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Price / Quote Badge (Optional)
                </label>
                <input
                  type="text"
                  placeholder="E.g., ₵280 / 50kg Bag"
                  value={newPostPriceTag}
                  onChange={e => setNewPostPriceTag(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Detailed Content / Message
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide full details about quantity, location, contact, or delivery..."
                  value={newPostContent}
                  onChange={e => setNewPostContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold rounded-xl border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg"
                >
                  Publish to Market Space
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
