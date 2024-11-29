import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import placeholderImage from '../assets/placeholder-nft.svg';

const NFTGallery = () => {
  const ITEMS_PER_PAGE = 50;
  const walletAddress = import.meta.env.NFT_WALLET_ADDRESS;
  const apiKey = import.meta.env.NFT_OPENSEA_API_KEY;
  const filterKeywords = import.meta.env.NFT_FILTER_KEYWORDS?.split(',').map(k => k.trim().toLowerCase()) || [];

  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [next, setNext] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalNFTs, setTotalNFTs] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreDebounceTimeout = useRef(null);
  const initialFetchDone = useRef(false);
  const isRequestInProgress = useRef(false);

  // 检查媒体类型
  const getMediaType = useCallback((nft) => {
    const imageUrl = nft.image_url || '';
    const mimeType = nft.mime_type || '';
    
    if (mimeType.startsWith('video/') || imageUrl.match(/\.(mp4|webm|ogg)$/i)) {
      return 'video';
    }
    return 'image';
  }, []);

  // 检查URL是否有效
  const isValidUrl = useCallback((url) => {
    if (!url) return false;
    return url.toLowerCase().startsWith('https://');
  }, []);

  // 检查NFT是否应该被过滤掉
  const shouldFilterNFT = useCallback((nft) => {
    // 检查图片URL是否有效
    const imageUrl = nft.image_url || '';
    if (!isValidUrl(imageUrl)) {
      return false;
    }

    // 检查标题关键词
    if (filterKeywords.length) {
      const title = (nft.name || '').toLowerCase();
      if (filterKeywords.some(keyword => title.includes(keyword))) {
        return false;
      }
    }

    // 检查图片URL是否是IPFS
    if (imageUrl.includes('ipfs.io')) {
      return false;
    }

    return true;
  }, [filterKeywords, isValidUrl]);

  // 渲染NFT媒体内容
  const renderNFTMedia = useCallback((nft) => {
    const mediaType = getMediaType(nft);
    const url = nft.image_url || '';

    if (mediaType === 'video') {
      return (
        <>
          <video
            src={url}
            className="w-full h-full object-cover"
            controls
            loop
            muted
            playsInline
            autoPlay
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <img
            src={placeholderImage}
            alt="Placeholder"
            className="w-full h-full object-cover hidden"
          />
        </>
      );
    }

    return (
      <img
        src={url}
        alt={nft.name || 'NFT'}
        className="w-full h-full object-cover"
        loading="lazy"
        onError={(e) => {
          e.target.src = placeholderImage;
        }}
      />
    );
  }, [getMediaType]);

  const fetchNFTs = useCallback(async (nextToken = null) => {
    if (!walletAddress || !apiKey) {
      setError('Wallet address or API key not configured');
      setLoading(false);
      return;
    }

    // 如果是初始加载且已经在进行中或完成，则返回
    if (!nextToken && (isRequestInProgress.current || initialFetchDone.current)) {
      return;
    }

    try {
      isRequestInProgress.current = true;

      const params = new URLSearchParams({
        limit: ITEMS_PER_PAGE.toString()
      });
      
      if (nextToken) {
        params.append('next', nextToken);
      }

      const response = await axios.get(
        `https://api.opensea.io/api/v2/chain/ethereum/account/${walletAddress}/nfts?${params.toString()}`,
        {
          headers: {
            'X-API-KEY': apiKey
          }
        }
      );

      const filteredNFTs = response.data.nfts.filter(shouldFilterNFT);
      setNfts(prevNfts => nextToken ? [...prevNfts, ...filteredNFTs] : filteredNFTs);
      setNext(response.data.next);
      setHasMore(response.data.next !== null && filteredNFTs.length > 0);
      setTotalNFTs(prev => nextToken ? prev + filteredNFTs.length : filteredNFTs.length);
      
      if (!nextToken) {
        initialFetchDone.current = true;
      }
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.error('Error fetching NFTs:', err.response || err);
        setError(err.response?.data?.message || 'Failed to fetch NFTs');
      }
    } finally {
      isRequestInProgress.current = false;
      setLoading(false);
    }
  }, []); // 移除所有依赖，因为这些值在组件生命周期内不会改变

  useEffect(() => {
    if (!initialFetchDone.current && !isRequestInProgress.current && walletAddress && apiKey) {
      setLoading(true);
      setError(null);
      fetchNFTs();
    }
  }, []); // 只在组件挂载时运行一次

  const debouncedLoadMore = () => {
    if (loadMoreDebounceTimeout.current) {
      clearTimeout(loadMoreDebounceTimeout.current);
    }

    loadMoreDebounceTimeout.current = setTimeout(() => {
      if (!loading && !loadingMore && hasMore && next) {
        setLoadingMore(true);
        fetchNFTs(next).finally(() => {
          setLoadingMore(false);
        });
      }
    }, 300);
  };

  const loadMore = () => {
    debouncedLoadMore();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl text-center mb-8">
          Curated NFT Collection
        </h2>
        {totalNFTs > 0 && (
          <p className="text-center text-gray-600 mb-8">
            Total NFTs: {totalNFTs}
          </p>
        )}
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {nfts.map((nft, index) => (
            <div key={`${nft.identifier}-${nft.collection?.slug}-${index}`} className="relative">
              <Link
                to={`/nft/${nft.contract}/${nft.identifier}`}
                className="block group"
              >
                <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="w-full h-[300px] bg-gray-200 rounded-t-lg overflow-hidden">
                    {renderNFTMedia(nft)}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary truncate">
                      {nft.name || 'Unnamed NFT'}
                    </h3>
                    <div className="flex items-center mt-1">
                      {nft.collection && (
                        <>
                          <span className="text-sm text-gray-500 truncate">
                            {typeof nft.collection === 'string' 
                              ? (nft.traits?.find(t => t.trait_type === 'collection')?.value || nft.collection)
                              : nft.collection?.name || 'Unknown Collection'}
                          </span>
                        </>
                      )}
                    </div>
                    {nft.contract && (
                      <p className="mt-1 text-xs text-gray-400">
                        Contract: {nft.contract.slice(0, 6)}...{nft.contract.slice(-4)}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
              {nft.collection && (
                <a
                  href={`https://opensea.io/collection/${typeof nft.collection === 'string' ? nft.collection : (nft.traits?.find(t => t.trait_type === 'collection')?.value || nft.collection)?.toLowerCase()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-4 right-4 p-2 bg-white/80 rounded-full text-gray-500 hover:text-primary hover:bg-white transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              )}
            </div>
          ))}
        </div>
        
        {loading && (
          <div className="text-center mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-xl text-gray-600">Loading NFTs...</p>
          </div>
        )}
        
        {!loading && hasMore && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Load More
            </button>
          </div>
        )}

        {!loading && nfts.length === 0 && (
          <p className="text-center text-gray-500 mt-8">
            No NFTs found
          </p>
        )}

        {!loading && !hasMore && nfts.length > 0 && (
          <p className="text-center text-gray-500 mt-8">
            No more NFTs to load
          </p>
        )}
      </div>
    </div>
  );
};

export default NFTGallery;
