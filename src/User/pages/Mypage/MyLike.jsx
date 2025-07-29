import CommerceList from '../../components/Commerce/CommerceList';

const MyLike = () => {
    return (
        <div className="p-6 max-w-6xl mx-auto">
            <CommerceList 
                showOnlyLiked={true} 
                title="내가 좋아요한 상품" 
            />
        </div>
    );
};

export default MyLike;
